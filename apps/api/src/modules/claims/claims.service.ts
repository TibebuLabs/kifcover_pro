import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitClaimDto, ReviewClaimDto } from './dto/submit-claim.dto';
import { ClaimStatus } from '@prisma/client';

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['PAID'],
  REJECTED: [],
  PAID: [],
};

@Injectable()
export class ClaimsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(userId: string, dto: SubmitClaimDto) {
    const policy = await this.prisma.policy.findFirst({
      where: { id: dto.policyId, userId, status: 'ACTIVE' },
    });
    if (!policy) throw new BadRequestException('Policy not found or not active');

    const incidentDate = new Date(dto.incidentDate);
    if (incidentDate > new Date()) throw new BadRequestException('Incident date cannot be in the future');
    if (incidentDate < policy.startDate) throw new BadRequestException('Incident date is before policy start date');
    if (dto.claimAmount > policy.coverageAmount) {
      throw new BadRequestException(`Claim amount exceeds coverage limit of ETB ${policy.coverageAmount}`);
    }

    return this.prisma.claim.create({
      data: {
        userId,
        policyId: dto.policyId,
        description: dto.description,
        incidentDate,
        claimAmount: dto.claimAmount,
        documents: dto.documents ?? [],
        status: 'SUBMITTED',
      },
      include: { policy: { include: { product: true } } },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.claim.findMany({
      where: { userId },
      include: { policy: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, requestingUserId?: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: {
        policy: { include: { product: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!claim) throw new NotFoundException('Claim not found');
    // Non-admin users can only view their own claims
    if (requestingUserId && claim.userId !== requestingUserId) {
      throw new ForbiddenException('Access denied');
    }
    return claim;
  }

  async findAll(page = 1, limit = 20, status?: string) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;
    const where = status ? { status: status as ClaimStatus } : {};

    const [claims, total] = await Promise.all([
      this.prisma.claim.findMany({
        where,
        skip,
        take: safeLimit,
        include: {
          policy: { include: { product: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.claim.count({ where }),
    ]);
    return { claims, total, page: safePage, limit: safeLimit };
  }

  async review(id: string, dto: ReviewClaimDto) {
    const claim = await this.prisma.claim.findUnique({ where: { id } });
    if (!claim) throw new NotFoundException('Claim not found');

    const allowed = VALID_STATUS_TRANSITIONS[claim.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition claim from ${claim.status} to ${dto.status}. Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }

    return this.prisma.claim.update({
      where: { id },
      data: {
        status: dto.status as any,
        approvedAmount: dto.approvedAmount,
        adminNotes: dto.adminNotes,
        resolvedAt: ['APPROVED', 'REJECTED', 'PAID'].includes(dto.status) ? new Date() : undefined,
      },
    });
  }
}

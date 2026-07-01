import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimStatus } from '@prisma/client';

const TRANSITIONS: Record<string, string[]> = {
  SUBMITTED:    ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED:     ['PAID'],
  REJECTED:     [],
  PAID:         [],
};

@Injectable()
export class ClaimsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(data: {
    userId: string; policyId: string; description: string;
    incidentDate: string; claimAmount: number; documents?: string[];
  }) {
    const policy = await this.prisma.policy.findFirst({
      where: { id: data.policyId, userId: data.userId, status: 'ACTIVE' },
    });
    if (!policy) throw new BadRequestException('Policy not found or not active');

    const incidentDate = new Date(data.incidentDate);
    if (incidentDate > new Date())        throw new BadRequestException('Incident date cannot be in the future');
    if (incidentDate < policy.startDate)  throw new BadRequestException('Incident before policy start date');
    if (data.claimAmount > policy.coverageAmount) {
      throw new BadRequestException(`Claim exceeds coverage limit of ETB ${policy.coverageAmount}`);
    }

    return this.prisma.claim.create({
      data: {
        userId: data.userId, policyId: data.policyId,
        description: data.description, incidentDate,
        claimAmount: data.claimAmount,
        documents: data.documents ?? [],
        status: 'SUBMITTED',
      },
      include: { policy: { include: { product: true } } },
    });
  }

  findByUser(userId: string) {
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
    if (requestingUserId && claim.userId !== requestingUserId) throw new ForbiddenException('Access denied');
    return claim;
  }

  async findAll(page = 1, limit = 20, status?: string) {
    const safePage  = Math.max(1, page);
    const safeLimit = Math.min(100, limit);
    const skip      = (safePage - 1) * safeLimit;
    const where     = status ? { status: status as ClaimStatus } : {};

    const [data, total] = await Promise.all([
      this.prisma.claim.findMany({
        where, skip, take: safeLimit,
        include: {
          policy: { include: { product: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.claim.count({ where }),
    ]);
    return { data, total, page: safePage, limit: safeLimit };
  }

  async review(id: string, newStatus: string, approvedAmount?: number, adminNotes?: string) {
    const claim = await this.prisma.claim.findUnique({ where: { id } });
    if (!claim) throw new NotFoundException('Claim not found');

    const allowed = TRANSITIONS[claim.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${claim.status} → ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }

    return this.prisma.claim.update({
      where: { id },
      data: {
        status: newStatus as ClaimStatus,
        approvedAmount,
        adminNotes,
        resolvedAt: ['APPROVED', 'REJECTED', 'PAID'].includes(newStatus) ? new Date() : undefined,
      },
    });
  }
}

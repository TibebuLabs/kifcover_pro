import {
  Injectable, NotFoundException, BadRequestException,
  ForbiddenException, Inject, InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimStatus } from '../../../../node_modules/.prisma/svc-claims-client';
import { MSG } from '@kifcover/shared-types';

const TRANSITIONS: Record<string, string[]> = {
  SUBMITTED:    ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED:     ['PAID'],
  REJECTED:     [],
  PAID:         [],
};

@Injectable()
export class ClaimsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('POLICIES_SERVICE') private readonly policiesSvc: ClientProxy,
  ) {}

  async submit(data: {
    userId: string; policyId: string; description: string;
    incidentDate: string; claimAmount: number; documents?: string[];
  }): Promise<any> {
    // Validate policy via svc-policies
    let policy: any;
    try {
      policy = await firstValueFrom(
        this.policiesSvc.send(MSG.POLICY_FIND_BY_ID, { id: data.policyId }).pipe(
          timeout(5000),
          catchError(() => throwError(() => new InternalServerErrorException('Policies service unavailable'))),
        ),
      );
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to validate policy');
    }

    if (!policy) throw new BadRequestException('Policy not found');
    if (policy.userId !== data.userId) throw new ForbiddenException('Policy does not belong to this user');
    if (policy.status !== 'ACTIVE') throw new BadRequestException('Policy is not active');

    const incidentDate = new Date(data.incidentDate);
    if (incidentDate > new Date()) throw new BadRequestException('Incident date cannot be in the future');
    if (incidentDate < new Date(policy.startDate)) throw new BadRequestException('Incident before policy start date');
    if (data.claimAmount > policy.coverageAmount) {
      throw new BadRequestException(`Claim exceeds coverage limit of ETB ${policy.coverageAmount}`);
    }

    return this.prisma.claim.create({
      data: {
        userId:        data.userId,
        policyId:      data.policyId,
        policyNumber:  policy.policyNumber ?? data.policyId,
        description:   data.description,
        incidentDate,
        claimAmount:   data.claimAmount,
        documents:     data.documents ?? [],
        status:        ClaimStatus.SUBMITTED,
      },
    });
  }

  findByUser(userId: string): Promise<any[]> {
    return this.prisma.claim.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, requestingUserId?: string): Promise<any> {
    const claim = await this.prisma.claim.findUnique({ where: { id } });
    if (!claim) throw new NotFoundException('Claim not found');
    if (requestingUserId && claim.userId !== requestingUserId) throw new ForbiddenException('Access denied');
    return claim;
  }

  async findAll(page = 1, limit = 20, status?: string): Promise<any> {
    const safePage  = Math.max(1, page);
    const safeLimit = Math.min(100, limit);
    const skip      = (safePage - 1) * safeLimit;
    const where: any = status ? { status: status as ClaimStatus } : {};

    const [data, total] = await Promise.all([
      this.prisma.claim.findMany({ where, skip, take: safeLimit, orderBy: { createdAt: 'desc' } }),
      this.prisma.claim.count({ where }),
    ]);
    return { data, total, page: safePage, limit: safeLimit };
  }

  async review(id: string, newStatus: string, approvedAmount?: number, adminNotes?: string): Promise<any> {
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

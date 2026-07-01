import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimStatus, PolicyStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformOverview() {
    const [
      totalUsers, totalPolicies, activePolicies,
      totalClaims, pendingClaims, revenueAgg, resolvedClaims,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.policy.count(),
      this.prisma.policy.count({ where: { status: PolicyStatus.ACTIVE } }),
      this.prisma.claim.count(),
      this.prisma.claim.count({ where: { status: ClaimStatus.SUBMITTED } }),
      this.prisma.policy.aggregate({ _sum: { premium: true } }),
      this.prisma.claim.findMany({
        where: { resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
      }),
    ]);

    const avgProcessingHours = resolvedClaims.length > 0
      ? resolvedClaims.reduce((acc, c) => {
          const diffMs = new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime();
          return acc + diffMs / (1000 * 60 * 60);
        }, 0) / resolvedClaims.length
      : 0;

    return {
      totalUsers,
      totalPolicies,
      activePolicies,
      totalClaims,
      pendingClaims,
      grossWrittenPremium: revenueAgg._sum.premium ?? 0,
      avgClaimProcessingHours: Math.round(avgProcessingHours * 10) / 10,
    };
  }

  getPolicyTrends(days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);
    return this.prisma.policy.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { createdAt: { gte: from } },
    });
  }

  getClaimTrends(days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);
    return this.prisma.claim.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { createdAt: { gte: from } },
    });
  }
}

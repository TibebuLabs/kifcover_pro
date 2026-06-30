import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformOverview() {
    const [
      totalUsers,
      totalPolicies,
      activePolicies,
      totalClaims,
      pendingClaims,
      totalRevenue,
      avgClaimProcessingMs,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.policy.count(),
      this.prisma.policy.count({ where: { status: 'ACTIVE' } }),
      this.prisma.claim.count(),
      this.prisma.claim.count({ where: { status: 'SUBMITTED' } }),
      this.prisma.policy.aggregate({ _sum: { premium: true } }),
      this.prisma.claim.findMany({
        where: { resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
      }),
    ]);

    const avgProcessingHours =
      avgClaimProcessingMs.length > 0
        ? avgClaimProcessingMs.reduce((acc: number, c: any) => {
            const diff = new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime();
            return acc + diff / (1000 * 60 * 60);
          }, 0) / avgClaimProcessingMs.length
        : 0;

    return {
      totalUsers,
      totalPolicies,
      activePolicies,
      totalClaims,
      pendingClaims,
      grossWrittenPremium: totalRevenue._sum.premium || 0,
      avgClaimProcessingHours: Math.round(avgProcessingHours * 10) / 10,
    };
  }

  async getPolicyTrends(days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);
    return this.prisma.policy.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { createdAt: { gte: from } },
    });
  }

  async getClaimTrends(days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);
    return this.prisma.claim.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { createdAt: { gte: from } },
    });
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { MSG } from '@kifcover/shared-types';

// Helper — call a service with a 5s timeout, return fallback on error
const safeCall = <T>(obs: any, fallback: T): Promise<T> =>
  firstValueFrom(obs.pipe(timeout(5000), catchError(() => of(fallback))));

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('USERS_SERVICE')    private readonly usersSvc: ClientProxy,
    @Inject('POLICIES_SERVICE') private readonly policiesSvc: ClientProxy,
    @Inject('CLAIMS_SERVICE')   private readonly claimsSvc: ClientProxy,
  ) {}

  async getPlatformOverview(): Promise<any> {
    const [usersResult, allPolicies, allClaims] = await Promise.all([
      safeCall(this.usersSvc.send(MSG.USER_FIND_ALL, { page: 1, limit: 1 }), { total: 0 }),
      safeCall(this.policiesSvc.send(MSG.POLICY_FIND_ALL, { page: 1, limit: 1000 }), { data: [], total: 0 }),
      safeCall(this.claimsSvc.send(MSG.CLAIM_FIND_ALL, { page: 1, limit: 1000 }), { data: [], total: 0 }),
    ]);

    const policies: any[] = (allPolicies as any).data ?? [];
    const claims: any[]   = (allClaims as any).data ?? [];

    const activePolicies      = policies.filter((p) => p.status === 'ACTIVE').length;
    const pendingClaims       = claims.filter((c) => c.status === 'SUBMITTED').length;
    const grossWrittenPremium = policies.reduce((sum, p) => sum + (p.premium ?? 0), 0);

    const resolvedClaims = claims.filter((c) => c.resolvedAt);
    const avgClaimProcessingHours = resolvedClaims.length > 0
      ? resolvedClaims.reduce((acc, c) => {
          const ms = new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime();
          return acc + ms / (1000 * 60 * 60);
        }, 0) / resolvedClaims.length
      : 0;

    return {
      totalUsers:              (usersResult as any).total ?? 0,
      totalPolicies:           (allPolicies as any).total ?? 0,
      activePolicies,
      totalClaims:             (allClaims as any).total ?? 0,
      pendingClaims,
      grossWrittenPremium:     Math.round(grossWrittenPremium * 100) / 100,
      avgClaimProcessingHours: Math.round(avgClaimProcessingHours * 10) / 10,
    };
  }

  async getPolicyTrends(days = 30): Promise<any> {
    const result = await safeCall(
      this.policiesSvc.send(MSG.POLICY_FIND_ALL, { page: 1, limit: 1000 }),
      { data: [] },
    );
    const policies: any[] = (result as any).data ?? [];
    const from = new Date();
    from.setDate(from.getDate() - days);

    // Group by status for policies created within the window
    const recent = policies.filter((p) => new Date(p.createdAt) >= from);
    const grouped: Record<string, number> = {};
    for (const p of recent) {
      grouped[p.status] = (grouped[p.status] ?? 0) + 1;
    }
    return Object.entries(grouped).map(([status, count]) => ({ status, _count: { id: count } }));
  }

  async getClaimTrends(days = 30): Promise<any> {
    const result = await safeCall(
      this.claimsSvc.send(MSG.CLAIM_FIND_ALL, { page: 1, limit: 1000 }),
      { data: [] },
    );
    const claims: any[] = (result as any).data ?? [];
    const from = new Date();
    from.setDate(from.getDate() - days);

    const recent = claims.filter((c) => new Date(c.createdAt) >= from);
    const grouped: Record<string, number> = {};
    for (const c of recent) {
      grouped[c.status] = (grouped[c.status] ?? 0) + 1;
    }
    return Object.entries(grouped).map(([status, count]) => ({ status, _count: { id: count } }));
  }
}

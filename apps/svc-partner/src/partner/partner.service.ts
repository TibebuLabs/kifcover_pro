import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MSG } from '@kifcover/shared-types';

const safe = <T>(obs: any, fallback: T): Promise<T> =>
  firstValueFrom(obs.pipe(timeout(5000), catchError(() => of(fallback))));

@Injectable()
export class PartnerService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CUSTOMER_SERVICE') private readonly customerSvc: ClientProxy,
  ) {}

  // ── Partner CRUD ───────────────────────────────────────────────────────────

  async create(data: {
    name: string; slug: string;
    webhookUrl?: string; logoUrl?: string; adminUserId?: string;
  }) {
    const existing = await this.prisma.partner.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('Partner slug already taken');

    return this.prisma.partner.create({ data });
  }

  findAll() {
    return this.prisma.partner.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const p = await this.prisma.partner.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Partner not found');
    return p;
  }

  async findByApiKey(apiKey: string) {
    const p = await this.prisma.partner.findFirst({
      where: { OR: [{ apiKeyProd: apiKey }, { apiKeySandbox: apiKey }] },
    });
    if (!p) throw new NotFoundException('Invalid API key');
    if (!p.isActive) throw new BadRequestException('Partner account is not active');
    return p;
  }

  async update(id: string, data: {
    name?: string; webhookUrl?: string; logoUrl?: string;
    isActive?: boolean; commissionRate?: number; contractUrl?: string;
  }) {
    await this.findById(id);
    return this.prisma.partner.update({ where: { id }, data });
  }

  async approve(id: string) {
    await this.findById(id);
    return this.prisma.partner.update({
      where: { id },
      data: { status: 'APPROVED', isActive: true },
    });
  }

  async reject(id: string, reason?: string) {
    await this.findById(id);
    return this.prisma.partner.update({
      where: { id },
      data: { status: 'REJECTED', isActive: false },
    });
  }

  async suspend(id: string) {
    await this.findById(id);
    return this.prisma.partner.update({
      where: { id },
      data: { status: 'SUSPENDED', isActive: false },
    });
  }

  // ── API key management ─────────────────────────────────────────────────────

  async regenerateApiKey(id: string, env: 'prod' | 'sandbox' = 'prod') {
    await this.findById(id);
    const newKey = `kif_${env === 'sandbox' ? 'sb_' : ''}${randomBytes(16).toString('hex')}`;
    const field  = env === 'sandbox' ? 'apiKeySandbox' : 'apiKeyProd';
    return this.prisma.partner.update({ where: { id }, data: { [field]: newKey } });
  }

  // ── Stats & analytics ──────────────────────────────────────────────────────

  async getStats(id: string) {
    const partner = await this.findById(id);

    const result = await safe(
      this.customerSvc.send(MSG.POLICY_FIND_ALL, { page: 1, limit: 1000, partnerId: id }),
      { data: [], total: 0 },
    );
    const policies: any[] = (result as any).data ?? [];

    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const activePolicies  = policies.filter(p => p.status === 'ACTIVE').length;
    const totalRevenue    = policies.reduce((s, p) => s + (p.premium ?? 0), 0);
    const monthlyRevenue  = policies
      .filter(p => new Date(p.createdAt) >= monthStart)
      .reduce((s, p) => s + (p.premium ?? 0), 0);
    const commissionEarned = Math.round(totalRevenue * partner.commissionRate * 100) / 100;

    const recentPayouts = await this.prisma.payout.findMany({
      where: { partnerId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // API usage summary for current month
    const apiCalls = await this.prisma.apiUsageLog.count({
      where: { partnerId: id, createdAt: { gte: monthStart } },
    });

    return {
      totalPolicies:   policies.length,
      activePolicies,
      totalRevenue:    Math.round(totalRevenue * 100) / 100,
      monthlyRevenue:  Math.round(monthlyRevenue * 100) / 100,
      commissionEarned,
      recentPolicies:  policies.slice(0, 5),
      recentPayouts,
      apiCallsThisMonth: apiCalls,
    };
  }

  // ── Payouts ────────────────────────────────────────────────────────────────

  async createPayout(data: { partnerId: string; amount: number; period: string; notes?: string }) {
    await this.findById(data.partnerId);
    return this.prisma.payout.create({ data });
  }

  async confirmPayout(id: string) {
    const p = await this.prisma.payout.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Payout not found');
    return this.prisma.payout.update({
      where: { id },
      data: { status: 'COMPLETED', paidAt: new Date() },
    });
  }

  findPayoutsByPartner(partnerId: string) {
    return this.prisma.payout.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Commission calculation (called after payment confirmed) ───────────────

  async calculateCommission(policyId: string, premium: number): Promise<void> {
    // Fetch policy to get partnerId
    const policy = await safe(
      this.customerSvc.send(MSG.POLICY_FIND_BY_ID, { id: policyId }),
      null,
    );
    if (!policy?.partnerId) return;

    // Idempotency: check if payout already created for this policy
    const existing = await this.prisma.payout.findFirst({
      where: { notes: `policy:${policyId}` },
    });
    if (existing) return;

    const partner = await this.prisma.partner.findUnique({ where: { id: policy.partnerId } });
    if (!partner) return;

    const amount = Math.round(premium * partner.commissionRate * 100) / 100;
    const period = new Date().toISOString().slice(0, 7);

    await this.prisma.payout.create({
      data: {
        partnerId: policy.partnerId,
        amount,
        period,
        status: 'PENDING',
        notes: `policy:${policyId}`,
      },
    });
  }

  // ── Webhook management ─────────────────────────────────────────────────────

  async logWebhook(partnerId: string, event: string, payload: any, statusCode?: number, response?: string) {
    return this.prisma.webhookLog.create({
      data: { partnerId, event, payload, statusCode, response },
    });
  }

  async getWebhookLogs(partnerId: string) {
    return this.prisma.webhookLog.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // ── API usage tracking ─────────────────────────────────────────────────────

  async logApiUsage(partnerId: string, endpoint: string, method: string, statusCode: number, latencyMs: number) {
    return this.prisma.apiUsageLog.create({
      data: { partnerId, endpoint, method, statusCode, latencyMs },
    });
  }

  async getApiUsageSummary(partnerId: string, days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const logs = await this.prisma.apiUsageLog.findMany({
      where: { partnerId, createdAt: { gte: from } },
      orderBy: { createdAt: 'asc' },
    });

    const totalCalls    = logs.length;
    const errorRate     = logs.filter(l => l.statusCode >= 400).length / (totalCalls || 1);
    const avgLatency    = totalCalls > 0
      ? Math.round(logs.reduce((s, l) => s + l.latencyMs, 0) / totalCalls)
      : 0;

    return { totalCalls, errorRate: Math.round(errorRate * 100), avgLatencyMs: avgLatency, logs: logs.slice(-50) };
  }
}

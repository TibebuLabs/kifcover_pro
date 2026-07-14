import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { MSG } from '@kifcover/shared-types';

@Injectable()
export class AdminService {
  private get db() { return this.prisma as any; }

  constructor(
    private readonly prisma: PrismaService,
    @Inject('CUSTOMER_SERVICE') private readonly customer: ClientProxy,
    @Inject('PARTNER_SERVICE')  private readonly partner:  ClientProxy,
    @Inject('INSURER_SERVICE')  private readonly insurer:  ClientProxy,
  ) {}

  // ── Platform overview ─────────────────────────────────────────────────────

  async getPlatformOverview() {
    const [users, policies, claims, partners] = await Promise.all([
      firstValueFrom(this.customer.send(MSG.USER_FIND_ALL, { page: 1, limit: 1 })),
      firstValueFrom(this.customer.send(MSG.POLICY_FIND_ALL, { page: 1, limit: 1 })),
      firstValueFrom(this.customer.send(MSG.CLAIM_FIND_ALL, { page: 1, limit: 1 })),
      firstValueFrom(this.partner.send(MSG.PARTNER_FIND_ALL, {})),
    ]);

    const activePolicies = await this.customer.send(MSG.POLICY_FIND_ALL, { page: 1, limit: 1, status: 'ACTIVE' }).toPromise().catch(() => ({ total: 0 }));
    const pendingClaims = await this.customer.send(MSG.CLAIM_FIND_ALL, { page: 1, limit: 1, status: 'SUBMITTED' }).toPromise().catch(() => ({ total: 0 }));

    return {
      totalUsers:      users?.total ?? 0,
      totalPolicies:   policies?.total ?? 0,
      activePolicies:  activePolicies?.total ?? 0,
      totalClaims:     claims?.total ?? 0,
      pendingClaims:   pendingClaims?.total ?? 0,
      totalPartners:   Array.isArray(partners) ? partners.length : 0,
      grossWrittenPremium: 0,
      avgClaimProcessingHours: 0,
    };
  }

  // ── Analytics trends ──────────────────────────────────────────────────────

  async getPolicyTrends(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await this.db.auditLog.groupBy({
      by: ['action'],
      where: {
        resource: 'policy',
        createdAt: { gte: cutoff },
      },
      _count: { id: true },
    });

    return result.map((r: any) => ({
      action: r.action,
      count: r._count.id,
    }));
  }

  async getClaimTrends(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await this.db.auditLog.groupBy({
      by: ['action'],
      where: {
        resource: 'claim',
        createdAt: { gte: cutoff },
      },
      _count: { id: true },
    });

    return result.map((r: any) => ({
      action: r.action,
      count: r._count.id,
    }));
  }

  // ── Audit logs ────────────────────────────────────────────────────────────

  async writeAuditLog(data: {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    service?: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    return this.db.auditLog.create({
      data: {
        userId:     data.userId     ?? null,
        userEmail:  data.userEmail  ?? null,
        userRole:   data.userRole   ?? null,
        service:    data.service    ?? 'admin',
        action:     data.action,
        resource:   data.resource,
        resourceId: data.resourceId ?? null,
        oldValues:  data.oldValues  ?? null,
        newValues:  data.newValues  ?? null,
        ipAddress:  data.ipAddress  ?? null,
        userAgent:  data.userAgent  ?? null,
        metadata:   data.metadata   ?? {},
      },
    });
  }

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    service?: string;
    action?: string;
    userId?: string;
  }) {
    const page  = Math.max(1, params.page  ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 50));
    const skip  = (page - 1) * limit;

    const where: any = {};
    if (params.service) where.service = params.service;
    if (params.action)  where.action  = params.action;
    if (params.userId)  where.userId  = params.userId;

    const [data, total] = await Promise.all([
      this.db.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      this.db.auditLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // ── Daily snapshots ───────────────────────────────────────────────────────

  async saveDailySnapshot() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [users, policies, claims] = await Promise.all([
      firstValueFrom(this.customer.send(MSG.USER_FIND_ALL, { page: 1, limit: 1 })),
      firstValueFrom(this.customer.send(MSG.POLICY_FIND_ALL, { page: 1, limit: 1 })),
      firstValueFrom(this.customer.send(MSG.CLAIM_FIND_ALL, { page: 1, limit: 1 })),
    ]);

    const snapshot = await this.db.dailySnapshot.upsert({
      where: { date: today },
      update: {
        totalUsers:    users?.total    ?? 0,
        totalPolicies: policies?.total ?? 0,
        totalClaims:   claims?.total   ?? 0,
      },
      create: {
        date:          today,
        totalUsers:    users?.total    ?? 0,
        totalPolicies: policies?.total ?? 0,
        totalClaims:   claims?.total   ?? 0,
      },
    });

    return snapshot;
  }

  async getDailySnapshots(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.db.dailySnapshot.findMany({
      where: { date: { gte: cutoff } },
      orderBy: { date: 'desc' },
    });
  }

  // ── User management (proxied to customer service) ─────────────────────────

  async adminFindAllUsers(page = 1, limit = 50) {
    return firstValueFrom(this.customer.send(MSG.USER_FIND_ALL, { page, limit }));
  }

  async adminUpdateUser(id: string, data: any) {
    return firstValueFrom(this.customer.send(MSG.USER_UPDATE, { id, ...data }));
  }

  async adminChangeRole(id: string, role: string) {
    return firstValueFrom(this.customer.send(MSG.USER_CHANGE_ROLE, { id, role }));
  }

  async adminToggleUser(id: string, isActive: boolean) {
    return firstValueFrom(this.customer.send(MSG.USER_DEACTIVATE, { id, isActive }));
  }

  // ── KYC (proxied to customer service) ─────────────────────────────────────

  async adminKycVerify(userId: string, approved: boolean) {
    return firstValueFrom(this.customer.send(MSG.KYC_VERIFY, { userId, approved }));
  }

  // ── Compliance flags (own DB) ─────────────────────────────────────────────

  async createComplianceFlag(data: {
    userId?: string;
    resourceId?: string;
    resource: string;
    reason: string;
    severity?: string;
  }) {
    return this.db.complianceFlag.create({
      data: {
        userId:     data.userId     ?? null,
        resourceId: data.resourceId ?? null,
        resource:   data.resource,
        reason:     data.reason,
        severity:   data.severity ?? 'MEDIUM',
      },
    });
  }

  async getComplianceFlags(params: { status?: string; severity?: string }) {
    const where: any = {};
    if (params.status)   where.status   = params.status;
    if (params.severity) where.severity = params.severity;

    return this.db.complianceFlag.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveComplianceFlag(id: string, reviewedBy: string, notes?: string) {
    const flag = await this.db.complianceFlag.findUnique({ where: { id } });
    if (!flag) throw new NotFoundException('Compliance flag not found');

    return this.db.complianceFlag.update({
      where: { id },
      data: {
        status:     'RESOLVED',
        reviewedBy,
        reviewedAt: new Date(),
        notes:      notes ?? null,
      },
    });
  }

  // ── Partner management (proxied to partner service) ───────────────────────

  async adminApprovePartner(id: string) {
    return firstValueFrom(this.partner.send('partner.approve', { id }));
  }

  async adminRejectPartner(id: string, reason?: string) {
    return firstValueFrom(this.partner.send('partner.reject', { id, reason }));
  }

  async adminSuspendPartner(id: string) {
    return firstValueFrom(this.partner.send('partner.suspend', { id }));
  }

  async adminGetAllPartners() {
    return firstValueFrom(this.partner.send(MSG.PARTNER_FIND_ALL, {}));
  }

  // ── Payout management (proxied to partner service) ────────────────────────

  async adminCreatePayout(data: { partnerId: string; amount: number; period: string }) {
    return firstValueFrom(this.partner.send('partner.create_payout', data));
  }

  async adminConfirmPayout(id: string) {
    return firstValueFrom(this.partner.send('partner.confirm_payout', { id }));
  }

  // ── Product management (proxied to insurer service) ───────────────────────

  async adminPublishProduct(id: string) {
    return firstValueFrom(this.insurer.send('insurer.product.publish', { id }));
  }

  async adminSuspendProduct(id: string) {
    return firstValueFrom(this.insurer.send('insurer.product.suspend', { id }));
  }

  // ── System settings (own DB) ──────────────────────────────────────────────

  async getSetting(key: string) {
    const setting = await this.db.systemSetting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting "${key}" not found`);
    return setting;
  }

  async setSetting(key: string, value: string) {
    return this.db.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getSettings() {
    return this.db.systemSetting.findMany({ orderBy: { key: 'asc' } });
  }
}

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { AdminService } from './admin.service';

@Controller()
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  // ── Platform overview ─────────────────────────────────────────────────────
  @MessagePattern(MSG.ANALYTICS_OVERVIEW)
  overview() { return this.svc.getPlatformOverview(); }

  @MessagePattern(MSG.ANALYTICS_POLICY_TRENDS)
  policyTrends(@Payload() p: { days?: number }) { return this.svc.getPolicyTrends(p.days); }

  @MessagePattern(MSG.ANALYTICS_CLAIM_TRENDS)
  claimTrends(@Payload() p: { days?: number }) { return this.svc.getClaimTrends(p.days); }

  // ── Audit logs ────────────────────────────────────────────────────────────
  @MessagePattern(MSG.ANALYTICS_AUDIT_LOG)
  writeAuditLog(@Payload() p: any) { return this.svc.writeAuditLog(p); }

  @MessagePattern(MSG.ANALYTICS_AUDIT_LIST)
  getAuditLogs(@Payload() p: any) { return this.svc.getAuditLogs(p); }

  // ── Snapshots ─────────────────────────────────────────────────────────────
  @MessagePattern('admin.snapshot.save')
  saveSnapshot() { return this.svc.saveDailySnapshot(); }

  @MessagePattern('admin.snapshot.list')
  listSnapshots(@Payload() p: { days?: number }) { return this.svc.getDailySnapshots(p.days); }

  // ── User management ───────────────────────────────────────────────────────
  @MessagePattern('admin.users.all')
  findAllUsers(@Payload() p: { page?: number; limit?: number }) {
    return this.svc.adminFindAllUsers(p.page, p.limit);
  }

  @MessagePattern('admin.user.update')
  updateUser(@Payload() p: { id: string; [key: string]: any }) {
    const { id, ...data } = p;
    return this.svc.adminUpdateUser(id, data);
  }

  @MessagePattern('admin.user.role')
  changeRole(@Payload() p: { id: string; role: string }) {
    return this.svc.adminChangeRole(p.id, p.role);
  }

  @MessagePattern('admin.user.toggle')
  toggleUser(@Payload() p: { id: string; isActive: boolean }) {
    return this.svc.adminToggleUser(p.id, p.isActive);
  }

  @MessagePattern('admin.kyc.verify')
  kycVerify(@Payload() p: { userId: string; approved: boolean }) {
    return this.svc.adminKycVerify(p.userId, p.approved);
  }

  // ── Compliance flags ──────────────────────────────────────────────────────
  @MessagePattern('admin.compliance.flag')
  createFlag(@Payload() p: any) { return this.svc.createComplianceFlag(p); }

  @MessagePattern('admin.compliance.flags')
  getFlags(@Payload() p: any) { return this.svc.getComplianceFlags(p); }

  @MessagePattern('admin.compliance.resolve')
  resolveFlag(@Payload() p: { id: string; reviewedBy: string; notes?: string }) {
    return this.svc.resolveComplianceFlag(p.id, p.reviewedBy, p.notes);
  }

  // ── Partner management ────────────────────────────────────────────────────
  @MessagePattern('admin.partner.approve')
  approvePartner(@Payload() p: { id: string }) { return this.svc.adminApprovePartner(p.id); }

  @MessagePattern('admin.partner.reject')
  rejectPartner(@Payload() p: { id: string; reason?: string }) { return this.svc.adminRejectPartner(p.id, p.reason); }

  @MessagePattern('admin.partner.suspend')
  suspendPartner(@Payload() p: { id: string }) { return this.svc.adminSuspendPartner(p.id); }

  @MessagePattern('admin.partners.all')
  allPartners() { return this.svc.adminGetAllPartners(); }

  @MessagePattern('admin.payout.create')
  createPayout(@Payload() p: { partnerId: string; amount: number; period: string }) {
    return this.svc.adminCreatePayout(p);
  }

  @MessagePattern('admin.payout.confirm')
  confirmPayout(@Payload() p: { id: string }) { return this.svc.adminConfirmPayout(p.id); }

  // ── Product management ────────────────────────────────────────────────────
  @MessagePattern('admin.product.publish')
  publishProduct(@Payload() p: { id: string }) { return this.svc.adminPublishProduct(p.id); }

  @MessagePattern('admin.product.suspend')
  suspendProduct(@Payload() p: { id: string }) { return this.svc.adminSuspendProduct(p.id); }

  // ── System settings ───────────────────────────────────────────────────────
  @MessagePattern('admin.settings.get')
  getSetting(@Payload() p: { key: string }) { return this.svc.getSetting(p.key); }

  @MessagePattern('admin.settings.set')
  setSetting(@Payload() p: { key: string; value: string }) { return this.svc.setSetting(p.key, p.value); }

  @MessagePattern('admin.settings.all')
  getSettings() { return this.svc.getSettings(); }
}

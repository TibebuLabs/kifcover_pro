import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { PartnerService } from './partner.service';

@Controller()
export class PartnerController {
  constructor(private readonly svc: PartnerService) {}

  // ── CRUD ───────────────────────────────────────────────────────────────────
  @MessagePattern(MSG.PARTNER_CREATE)
  create(@Payload() p: any) { return this.svc.create(p); }

  @MessagePattern(MSG.PARTNER_FIND_ALL)
  findAll() { return this.svc.findAll(); }

  @MessagePattern(MSG.PARTNER_FIND_BY_ID)
  findById(@Payload() p: { id: string }) { return this.svc.findById(p.id); }

  @MessagePattern('partner.find_by_api_key')
  findByApiKey(@Payload() p: { apiKey: string }) { return this.svc.findByApiKey(p.apiKey); }

  @MessagePattern(MSG.PARTNER_UPDATE)
  update(@Payload() p: { id: string; [key: string]: any }) {
    const { id, ...data } = p;
    return this.svc.update(id, data);
  }

  @MessagePattern('partner.approve')
  approve(@Payload() p: { id: string }) { return this.svc.approve(p.id); }

  @MessagePattern('partner.reject')
  reject(@Payload() p: { id: string; reason?: string }) { return this.svc.reject(p.id, p.reason); }

  @MessagePattern('partner.suspend')
  suspend(@Payload() p: { id: string }) { return this.svc.suspend(p.id); }

  // ── API keys ───────────────────────────────────────────────────────────────
  @MessagePattern(MSG.PARTNER_REGEN_KEY)
  regenKey(@Payload() p: { id: string; env?: 'prod' | 'sandbox' }) {
    return this.svc.regenerateApiKey(p.id, p.env || 'prod');
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  @MessagePattern(MSG.PARTNER_GET_STATS)
  getStats(@Payload() p: { id: string }) { return this.svc.getStats(p.id); }

  // ── Payouts ────────────────────────────────────────────────────────────────
  @MessagePattern('partner.create_payout')
  createPayout(@Payload() p: { partnerId: string; amount: number; period: string; notes?: string }) {
    return this.svc.createPayout(p);
  }

  @MessagePattern('partner.confirm_payout')
  confirmPayout(@Payload() p: { id: string }) { return this.svc.confirmPayout(p.id); }

  @MessagePattern('partner.list_payouts')
  listPayouts(@Payload() p: { partnerId: string }) { return this.svc.findPayoutsByPartner(p.partnerId); }

  // ── Commission ─────────────────────────────────────────────────────────────
  @MessagePattern('partner.calculate_commission')
  calculateCommission(@Payload() p: { policyId: string; premium: number }) {
    return this.svc.calculateCommission(p.policyId, p.premium);
  }

  // ── Webhooks & API usage ───────────────────────────────────────────────────
  @MessagePattern('partner.webhook_log')
  logWebhook(@Payload() p: { partnerId: string; event: string; payload: any; statusCode?: number; response?: string }) {
    return this.svc.logWebhook(p.partnerId, p.event, p.payload, p.statusCode, p.response);
  }

  @MessagePattern('partner.webhook_logs')
  getWebhookLogs(@Payload() p: { partnerId: string }) { return this.svc.getWebhookLogs(p.partnerId); }

  @MessagePattern('partner.api_usage_log')
  logApiUsage(@Payload() p: { partnerId: string; endpoint: string; method: string; statusCode: number; latencyMs: number }) {
    return this.svc.logApiUsage(p.partnerId, p.endpoint, p.method, p.statusCode, p.latencyMs);
  }

  @MessagePattern('partner.api_usage_summary')
  getApiUsageSummary(@Payload() p: { partnerId: string; days?: number }) {
    return this.svc.getApiUsageSummary(p.partnerId, p.days);
  }
}

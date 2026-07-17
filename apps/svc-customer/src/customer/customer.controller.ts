import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { CustomerService } from './customer.service';

@Controller()
export class CustomerController {
  constructor(private readonly svc: CustomerService) {}

  // ── Users ──────────────────────────────────────────────────────────────────
  @MessagePattern(MSG.USER_FIND_ALL)
  findAll(@Payload() p: { page: number; limit: number }) {
    return this.svc.findAll(p.page, p.limit);
  }

  @MessagePattern(MSG.USER_FIND_BY_ID)
  findById(@Payload() p: { id: string }) {
    return this.svc.findById(p.id);
  }

  @MessagePattern(MSG.USER_FIND_BY_EMAIL)
  findByEmail(@Payload() p: { email: string }) {
    return this.svc.findByEmail(p.email);
  }

  @MessagePattern(MSG.USER_UPDATE)
  update(@Payload() p: { id: string; [key: string]: any }) {
    const { id, ...data } = p;
    return this.svc.update(id, data);
  }

  @MessagePattern(MSG.USER_CHANGE_ROLE)
  changeRole(@Payload() p: { id: string; role: string }) {
    return this.svc.changeRole(p.id, p.role);
  }

  @MessagePattern(MSG.USER_DEACTIVATE)
  deactivate(@Payload() p: { id: string; isActive: boolean }) {
    return this.svc.deactivate(p.id, p.isActive);
  }

  // ── KYC ────────────────────────────────────────────────────────────────────
  @MessagePattern(MSG.KYC_UPLOAD)
  kycUpload(@Payload() p: { userId: string; type: string; fileUrl: string; ocrData?: any }) {
    return this.svc.kycUpload(p.userId, p.type, p.fileUrl, p.ocrData);
  }

  @MessagePattern(MSG.KYC_GET_STATUS)
  kycGetStatus(@Payload() p: { userId: string }) {
    return this.svc.kycGetStatus(p.userId);
  }

  @MessagePattern(MSG.KYC_VERIFY)
  kycVerify(@Payload() p: { userId: string; approved: boolean }) {
    return this.svc.kycVerify(p.userId, p.approved);
  }

  // ── Quotes ─────────────────────────────────────────────────────────────────
  @MessagePattern(MSG.QUOTE_GENERATE)
  generateQuote(@Payload() p: { productId: string; metadata: any; userId?: string }) {
    return this.svc.generateQuote(p.productId, p.metadata, p.userId);
  }

  @MessagePattern(MSG.QUOTE_FIND_BY_ID)
  findQuoteById(@Payload() p: { id: string }) {
    return this.svc.findQuoteById(p.id);
  }

  // ── Policies ───────────────────────────────────────────────────────────────
  @MessagePattern(MSG.POLICY_ISSUE)
  issuePolicy(@Payload() p: { userId: string; quoteId: string; partnerId?: string }) {
    return this.svc.issuePolicy(p.userId, p.quoteId, p.partnerId);
  }

  @MessagePattern(MSG.POLICY_FIND_BY_USER)
  findPoliciesByUser(@Payload() p: { userId: string }) {
    return this.svc.findPoliciesByUser(p.userId);
  }

  @MessagePattern(MSG.POLICY_FIND_BY_ID)
  findPolicyById(@Payload() p: { id: string }) {
    return this.svc.findPolicyById(p.id);
  }

  @MessagePattern(MSG.POLICY_CANCEL)
  cancelPolicy(@Payload() p: { id: string; userId: string; userRole?: string }) {
    return this.svc.cancelPolicy(p.id, p.userId, p.userRole);
  }

  @MessagePattern(MSG.POLICY_RENEW)
  renewPolicy(@Payload() p: { id: string; userId: string }) {
    return this.svc.renewPolicy(p.id, p.userId);
  }

  @MessagePattern(MSG.POLICY_FIND_ALL)
  findAllPolicies(@Payload() p: { page: number; limit: number; status?: string; partnerId?: string }) {
    return this.svc.findAllPolicies(p.page, p.limit, p.status, p.partnerId);
  }

  // ── Claims ─────────────────────────────────────────────────────────────────
  @MessagePattern(MSG.CLAIM_SUBMIT)
  submitClaim(@Payload() p: {
    userId: string; policyId: string; description: string;
    incidentDate: string; claimAmount: number; documents?: string[];
  }) {
    return this.svc.submitClaim({ ...p, incidentDate: new Date(p.incidentDate) });
  }

  @MessagePattern(MSG.CLAIM_FIND_BY_USER)
  findClaimsByUser(@Payload() p: { userId: string }) {
    return this.svc.findClaimsByUser(p.userId);
  }

  @MessagePattern(MSG.CLAIM_FIND_BY_ID)
  findClaimById(@Payload() p: { id: string; requestingUserId?: string }) {
    return this.svc.findClaimById(p.id, p.requestingUserId);
  }

  @MessagePattern(MSG.CLAIM_FIND_ALL)
  findAllClaims(@Payload() p: { page: number; limit: number; status?: string }) {
    return this.svc.findAllClaims(p.page, p.limit, p.status);
  }

  @MessagePattern(MSG.CLAIM_REVIEW)
  reviewClaim(@Payload() p: { id: string; status: string; approvedAmount?: number; adminNotes?: string }) {
    return this.svc.reviewClaim(p.id, p.status, p.approvedAmount, p.adminNotes);
  }

  // ── Payments ───────────────────────────────────────────────────────────────
  @MessagePattern(MSG.PAYMENT_INITIATE)
  initiatePayment(@Payload() p: any) {
    return this.svc.initiatePayment(p);
  }

  @MessagePattern(MSG.PAYMENT_CONFIRM)
  confirmPayment(@Payload() p: { id: string; providerRef: string }) {
    return this.svc.confirmPayment(p.id, p.providerRef);
  }

  @MessagePattern(MSG.PAYMENT_FIND_BY_POLICY)
  findPaymentsByPolicy(@Payload() p: { policyId: string }) {
    return this.svc.findPaymentsByPolicy(p.policyId);
  }

  @MessagePattern('payment.find_by_user')
  findPaymentsByUser(@Payload() p: { userId: string }) {
    return this.svc.findPaymentsByUser(p.userId);
  }
}

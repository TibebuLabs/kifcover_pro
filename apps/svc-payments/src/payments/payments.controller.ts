import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @MessagePattern(MSG.PAYMENT_INITIATE)
  initiate(@Payload() p: { policyId?: string; claimId?: string; amount: number; provider: string; metadata?: any }) {
    return this.svc.initiate(p);
  }

  @MessagePattern(MSG.PAYMENT_CONFIRM)
  confirm(@Payload() p: { id: string; providerRef: string }) {
    return this.svc.confirm(p.id, p.providerRef);
  }

  @MessagePattern(MSG.PAYMENT_FIND_BY_POLICY)
  findByPolicy(@Payload() p: { policyId: string }) {
    return this.svc.findByPolicy(p.policyId);
  }
}

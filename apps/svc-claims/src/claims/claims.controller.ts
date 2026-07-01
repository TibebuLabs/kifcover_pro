import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { ClaimsService } from './claims.service';

@Controller()
export class ClaimsController {
  constructor(private readonly svc: ClaimsService) {}

  @MessagePattern(MSG.CLAIM_SUBMIT)
  submit(@Payload() p: {
    userId: string; policyId: string; description: string;
    incidentDate: string; claimAmount: number; documents?: string[];
  }) {
    return this.svc.submit(p);
  }

  @MessagePattern(MSG.CLAIM_FIND_BY_USER)
  findByUser(@Payload() p: { userId: string }) {
    return this.svc.findByUser(p.userId);
  }

  @MessagePattern(MSG.CLAIM_FIND_BY_ID)
  findById(@Payload() p: { id: string; requestingUserId?: string }) {
    return this.svc.findById(p.id, p.requestingUserId);
  }

  @MessagePattern(MSG.CLAIM_FIND_ALL)
  findAll(@Payload() p: { page: number; limit: number; status?: string }) {
    return this.svc.findAll(p.page, p.limit, p.status);
  }

  @MessagePattern(MSG.CLAIM_REVIEW)
  review(@Payload() p: { id: string; status: string; approvedAmount?: number; adminNotes?: string }) {
    return this.svc.review(p.id, p.status, p.approvedAmount, p.adminNotes);
  }
}

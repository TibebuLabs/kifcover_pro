import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { PoliciesService } from './policies.service';

@Controller()
export class PoliciesController {
  constructor(private readonly svc: PoliciesService) {}

  @MessagePattern(MSG.POLICY_ISSUE)
  issue(@Payload() p: { userId: string; quoteId: string; partnerId?: string }) {
    return this.svc.issue(p.userId, p.quoteId, p.partnerId);
  }

  @MessagePattern(MSG.POLICY_FIND_BY_USER)
  findByUser(@Payload() p: { userId: string }) {
    return this.svc.findByUser(p.userId);
  }

  @MessagePattern(MSG.POLICY_FIND_BY_ID)
  findById(@Payload() p: { id: string }) {
    return this.svc.findById(p.id);
  }

  @MessagePattern(MSG.POLICY_FIND_ALL)
  findAll(@Payload() p: { page: number; limit: number; status?: string; partnerId?: string }) {
    return this.svc.findAll(p.page, p.limit, p.status, p.partnerId);
  }
}

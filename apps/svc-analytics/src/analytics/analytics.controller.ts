import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { AnalyticsService } from './analytics.service';

@Controller()
export class AnalyticsController {
  constructor(private readonly svc: AnalyticsService) {}

  @MessagePattern(MSG.ANALYTICS_OVERVIEW)
  overview() {
    return this.svc.getPlatformOverview();
  }

  @MessagePattern(MSG.ANALYTICS_POLICY_TRENDS)
  policyTrends(@Payload() p: { days: number }) {
    return this.svc.getPolicyTrends(p.days);
  }

  @MessagePattern(MSG.ANALYTICS_CLAIM_TRENDS)
  claimTrends(@Payload() p: { days: number }) {
    return this.svc.getClaimTrends(p.days);
  }
}

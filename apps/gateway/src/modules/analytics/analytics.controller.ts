import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiQuery,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';

@ApiTags('📊 Analytics')
@ApiBearerAuth()
@Roles('PLATFORM_ADMIN', 'INSURANCE_PROVIDER')
@Controller('analytics')
export class AnalyticsController {
  constructor(@Inject('ANALYTICS_SERVICE') private readonly svc: ClientProxy) {}

  // ── Platform KPIs ─────────────────────────────────────────────────────────

  @Get('overview')
  @ApiOperation({
    summary: 'Platform-wide KPI overview — admin/insurer only',
    description: 'Returns: totalUsers, totalPolicies, activePolicies, totalClaims, pendingClaims, grossWrittenPremium, avgClaimProcessingHours',
  })
  @ApiResponse({
    status: 200,
    description: 'Platform overview KPIs',
    schema: {
      example: {
        totalUsers: 1248,
        totalPolicies: 4520,
        activePolicies: 3890,
        totalClaims: 312,
        pendingClaims: 47,
        grossWrittenPremium: 4200000,
        avgClaimProcessingHours: 31.4,
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Requires PLATFORM_ADMIN or INSURANCE_PROVIDER role' })
  overview() {
    return firstValueFrom(this.svc.send(MSG.ANALYTICS_OVERVIEW, {}));
  }

  // ── Policy trends ─────────────────────────────────────────────────────────

  @Get('policies/trends')
  @ApiOperation({ summary: 'Policy volume trends by status over N days' })
  @ApiQuery({ name: 'days', required: false, example: 30, description: 'Lookback window in days (default 30)' })
  @ApiResponse({ status: 200, description: 'Array of { status, _count: { id } }' })
  policyTrends(@Query('days') days = 30) {
    return firstValueFrom(this.svc.send(MSG.ANALYTICS_POLICY_TRENDS, { days: +days }));
  }

  // ── Claim trends ──────────────────────────────────────────────────────────

  @Get('claims/trends')
  @ApiOperation({ summary: 'Claim volume trends by status over N days' })
  @ApiQuery({ name: 'days', required: false, example: 30, description: 'Lookback window in days (default 30)' })
  @ApiResponse({ status: 200, description: 'Array of { status, _count: { id } }' })
  claimTrends(@Query('days') days = 30) {
    return firstValueFrom(this.svc.send(MSG.ANALYTICS_CLAIM_TRENDS, { days: +days }));
  }
}

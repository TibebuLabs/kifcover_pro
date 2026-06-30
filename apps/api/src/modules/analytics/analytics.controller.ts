import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PLATFORM_ADMIN', 'INSURANCE_PROVIDER')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Platform-wide KPI overview (admin only)' })
  overview() {
    return this.analyticsService.getPlatformOverview();
  }

  @Get('policies/trends')
  @ApiOperation({ summary: 'Policy trends by status' })
  @ApiQuery({ name: 'days', required: false })
  policyTrends(@Query('days') days = 30) {
    return this.analyticsService.getPolicyTrends(+days);
  }

  @Get('claims/trends')
  @ApiOperation({ summary: 'Claims trends by status' })
  @ApiQuery({ name: 'days', required: false })
  claimTrends(@Query('days') days = 30) {
    return this.analyticsService.getClaimTrends(+days);
  }
}

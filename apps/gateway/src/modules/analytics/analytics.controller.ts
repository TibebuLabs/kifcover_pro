import { Controller, Get, Query, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';
import { JwtGatewayGuard } from '../../guards/jwt-gateway.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtGatewayGuard)
@Roles('PLATFORM_ADMIN', 'INSURANCE_PROVIDER')
@Controller('analytics')
export class AnalyticsController {
  constructor(@Inject('ANALYTICS_SERVICE') private readonly svc: ClientProxy) {}

  @Get('overview')
  @ApiOperation({ summary: 'Platform KPI overview' })
  overview() {
    return firstValueFrom(this.svc.send(MSG.ANALYTICS_OVERVIEW, {}));
  }

  @Get('policies/trends')
  @ApiOperation({ summary: 'Policy trends by status' })
  @ApiQuery({ name: 'days', required: false })
  policyTrends(@Query('days') days = 30) {
    return firstValueFrom(this.svc.send(MSG.ANALYTICS_POLICY_TRENDS, { days: +days }));
  }

  @Get('claims/trends')
  @ApiOperation({ summary: 'Claims trends by status' })
  @ApiQuery({ name: 'days', required: false })
  claimTrends(@Query('days') days = 30) {
    return firstValueFrom(this.svc.send(MSG.ANALYTICS_CLAIM_TRENDS, { days: +days }));
  }
}

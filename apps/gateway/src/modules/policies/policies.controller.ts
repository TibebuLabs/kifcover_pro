import { Controller, Post, Get, Param, Body, Query, Inject, UseGuards, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';
import { JwtGatewayGuard } from '../../guards/jwt-gateway.guard';

@ApiTags('Policies')
@ApiBearerAuth()
@UseGuards(JwtGatewayGuard)
@Controller('policies')
export class PoliciesController {
  constructor(@Inject('POLICIES_SERVICE') private readonly svc: ClientProxy) {}

  @Post('issue')
  @ApiOperation({ summary: 'Issue policy from a quote' })
  issue(@Request() req: any, @Body() body: { quoteId: string; partnerId?: string }) {
    return firstValueFrom(this.svc.send(MSG.POLICY_ISSUE, { userId: req.user.id, ...body }));
  }

  @Get('my')
  @ApiOperation({ summary: "Get current user's policies" })
  myPolicies(@Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.POLICY_FIND_BY_USER, { userId: req.user.id }));
  }

  @Roles('PLATFORM_ADMIN', 'INSURANCE_PROVIDER', 'PARTNER_ADMIN')
  @Get()
  @ApiOperation({ summary: 'List all policies (admin/partner)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'partnerId', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
    @Query('partnerId') partnerId?: string,
  ) {
    return firstValueFrom(this.svc.send(MSG.POLICY_FIND_ALL, { page: +page, limit: +limit, status, partnerId }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy by ID' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.POLICY_FIND_BY_ID, { id }));
  }
}

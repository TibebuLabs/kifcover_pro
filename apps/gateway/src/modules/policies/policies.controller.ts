import { Controller, Post, Get, Param, Body, Query, Inject, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiParam, ApiQuery, ApiBody,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';
import { IssuePolicyDto } from '../../dto';

@ApiTags('📋 Policies')
@ApiBearerAuth()
@Controller('policies')
export class PoliciesController {
  constructor(@Inject('POLICIES_SERVICE') private readonly svc: ClientProxy) {}

  // ── Issue policy ──────────────────────────────────────────────────────────

  @Post('issue')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Convert a quote into an active policy',
    description: 'Requires KYC verified status. Validates quote not expired or already used.',
  })
  @ApiBody({ type: IssuePolicyDto })
  @ApiResponse({ status: 201, description: 'Policy issued — returns full policy object with QR code' })
  @ApiResponse({ status: 400, description: 'Quote expired, already used, or KYC not verified' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  issue(@Request() req: any, @Body() dto: IssuePolicyDto) {
    return firstValueFrom(this.svc.send(MSG.POLICY_ISSUE, { userId: req.user.id, ...dto }));
  }

  // ── My policies ───────────────────────────────────────────────────────────

  @Get('my')
  @ApiOperation({ summary: "Get the current user's policies" })
  @ApiResponse({ status: 200, description: 'Array of Policy objects' })
  myPolicies(@Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.POLICY_FIND_BY_USER, { userId: req.user.id }));
  }

  // ── List all policies (admin/partner) ─────────────────────────────────────

  @Roles('PLATFORM_ADMIN', 'INSURANCE_PROVIDER', 'PARTNER_ADMIN')
  @Get()
  @ApiOperation({ summary: 'List all policies — admin/partner only' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'] })
  @ApiQuery({ name: 'partnerId', required: false, description: 'Filter by partner' })
  @ApiResponse({ status: 200, description: '{ data: Policy[], total, page, limit }' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
    @Query('partnerId') partnerId?: string,
  ) {
    return firstValueFrom(this.svc.send(MSG.POLICY_FIND_ALL, { page: +page, limit: +limit, status, partnerId }));
  }

  // ── Get policy by ID ──────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get policy details by ID' })
  @ApiParam({ name: 'id', description: 'Policy UUID' })
  @ApiResponse({ status: 200, description: 'Full policy object including product and claims' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.POLICY_FIND_BY_ID, { id }));
  }
}

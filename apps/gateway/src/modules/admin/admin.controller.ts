import {
  Controller, Get, Post, Patch, Param, Body, Query,
  Inject, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';

@ApiTags('🛡️ Admin')
@ApiBearerAuth()
@Roles('PLATFORM_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly svc: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly auth: ClientProxy,
  ) {}

  // ── Platform overview ─────────────────────────────────────────────────────
  @Get('overview')
  @ApiOperation({ summary: 'Platform-wide KPI dashboard' })
  overview() { return firstValueFrom(this.svc.send(MSG.ANALYTICS_OVERVIEW, {})); }

  @Get('analytics/policies/trends')
  @ApiOperation({ summary: 'Policy volume trends by status' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  policyTrends(@Query('days') days = 30) {
    return firstValueFrom(this.svc.send(MSG.ANALYTICS_POLICY_TRENDS, { days: +days }));
  }

  @Get('analytics/claims/trends')
  @ApiOperation({ summary: 'Claim volume trends by status' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  claimTrends(@Query('days') days = 30) {
    return firstValueFrom(this.svc.send(MSG.ANALYTICS_CLAIM_TRENDS, { days: +days }));
  }

  @Get('analytics/snapshots')
  @ApiOperation({ summary: 'Daily KPI snapshots' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  snapshots(@Query('days') days = 30) {
    return firstValueFrom(this.svc.send('admin.snapshot.list', { days: +days }));
  }

  // ── Audit logs ────────────────────────────────────────────────────────────
  @Get('audit-logs')
  @ApiOperation({ summary: 'Immutable audit trail — admin only' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'service', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'userId', required: false })
  auditLogs(
    @Query('page') page = 1, @Query('limit') limit = 50,
    @Query('service') service?: string, @Query('action') action?: string,
    @Query('userId') userId?: string,
  ) {
    return firstValueFrom(this.svc.send(MSG.ANALYTICS_AUDIT_LIST, { page: +page, limit: +limit, service, action, userId }));
  }

  // ── Compliance / KYC queue ────────────────────────────────────────────────
  @Post('kyc/:userId/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject KYC submission' })
  kycVerify(@Param('userId') userId: string, @Body() body: { approved: boolean }) {
    return firstValueFrom(this.svc.send('admin.kyc.verify', { userId, approved: body.approved }));
  }

  @Get('compliance/flags')
  @ApiOperation({ summary: 'AML/compliance flags queue' })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN','UNDER_REVIEW','RESOLVED','DISMISSED'] })
  @ApiQuery({ name: 'severity', required: false, enum: ['LOW','MEDIUM','HIGH','CRITICAL'] })
  getFlags(@Query('status') status?: string, @Query('severity') severity?: string) {
    return firstValueFrom(this.svc.send('admin.compliance.flags', { status, severity }));
  }

  @Patch('compliance/flags/:id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve a compliance flag' })
  resolveFlag(@Param('id') id: string, @Body() body: { reviewedBy: string; notes?: string }) {
    return firstValueFrom(this.svc.send('admin.compliance.resolve', { id, ...body }));
  }

  // ── Partner management ────────────────────────────────────────────────────
  @Post('partners/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve partner application' })
  approvePartner(@Param('id') id: string) {
    return firstValueFrom(this.svc.send('admin.partner.approve', { id }));
  }

  @Post('partners/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject partner application' })
  rejectPartner(@Param('id') id: string, @Body() body: { reason?: string }) {
    return firstValueFrom(this.svc.send('admin.partner.reject', { id, ...body }));
  }

  @Post('partners/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a partner account' })
  suspendPartner(@Param('id') id: string) {
    return firstValueFrom(this.svc.send('admin.partner.suspend', { id }));
  }

  @Post('payouts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create partner payout batch' })
  createPayout(@Body() body: { partnerId: string; amount: number; period: string }) {
    return firstValueFrom(this.svc.send('admin.payout.create', body));
  }

  @Post('payouts/:id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm payout sent' })
  confirmPayout(@Param('id') id: string) {
    return firstValueFrom(this.svc.send('admin.payout.confirm', { id }));
  }

  // ── Product publishing ────────────────────────────────────────────────────
  @Post('products/:id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish insurer product to marketplace' })
  publishProduct(@Param('id') id: string) {
    return firstValueFrom(this.svc.send('admin.product.publish', { id }));
  }

  @Post('products/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a product from marketplace' })
  suspendProduct(@Param('id') id: string) {
    return firstValueFrom(this.svc.send('admin.product.suspend', { id }));
  }

  // ── System settings ───────────────────────────────────────────────────────
  @Get('settings')
  @ApiOperation({ summary: 'Get all system settings' })
  getSettings() { return firstValueFrom(this.svc.send('admin.settings.all', {})); }

  @Patch('settings/:key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a system setting' })
  setSetting(@Param('key') key: string, @Body() body: { value: string }) {
    return firstValueFrom(this.svc.send('admin.settings.set', { key, value: body.value }));
  }

  // ── User approval ───────────────────────────────────────────────────────
  @Get('users/pending')
  @ApiOperation({ summary: 'List users pending admin approval' })
  getPendingUsers() {
    return firstValueFrom(this.auth.send(MSG.AUTH_USERS_PENDING, {}));
  }

  @Post('users/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a pending user' })
  approveUser(@Param('id') id: string) {
    return firstValueFrom(this.auth.send(MSG.AUTH_USER_APPROVE, { id }));
  }

  @Post('users/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject and remove a pending user' })
  rejectUser(@Param('id') id: string) {
    return firstValueFrom(this.auth.send(MSG.AUTH_USER_REJECT, { id }));
  }
}

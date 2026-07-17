import {
  Controller, Get, Post, Patch, Param, Body, Query,
  Inject, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { IsString, IsOptional, IsNumber, IsBoolean, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';

class CreatePartnerDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() slug: string;
  @ApiPropertyOptional() @IsOptional() @IsString() webhookUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string;
}

class UpdatePartnerDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() webhookUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() webhookSecret?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) commissionRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() contractUrl?: string;
}

@ApiTags('🤝 Partner')
@ApiBearerAuth()
@Controller('partner')
export class PartnerController {
  constructor(@Inject('PARTNER_SERVICE') private readonly svc: ClientProxy) {}

  // ── Partner registration & management ─────────────────────────────────────
  @Roles('PLATFORM_ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new partner — admin only' })
  create(@Body() dto: CreatePartnerDto) {
    return firstValueFrom(this.svc.send(MSG.PARTNER_CREATE, dto));
  }

  @Roles('PLATFORM_ADMIN')
  @Get()
  @ApiOperation({ summary: 'List all partners — admin only' })
  findAll() {
    return firstValueFrom(this.svc.send(MSG.PARTNER_FIND_ALL, {}));
  }

  @Roles('PLATFORM_ADMIN','PARTNER_ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Get partner by ID' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.PARTNER_FIND_BY_ID, { id }));
  }

  @Roles('PLATFORM_ADMIN','PARTNER_ADMIN')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update partner details' })
  update(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
    return firstValueFrom(this.svc.send(MSG.PARTNER_UPDATE, { id, ...dto }));
  }

  @Roles('PLATFORM_ADMIN')
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve partner application — admin only' })
  approve(@Param('id') id: string) {
    return firstValueFrom(this.svc.send('partner.approve', { id }));
  }

  @Roles('PLATFORM_ADMIN')
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject partner application — admin only' })
  reject(@Param('id') id: string, @Body() body: { reason?: string }) {
    return firstValueFrom(this.svc.send('partner.reject', { id, ...body }));
  }

  @Roles('PLATFORM_ADMIN')
  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a partner — admin only' })
  suspend(@Param('id') id: string) {
    return firstValueFrom(this.svc.send('partner.suspend', { id }));
  }

  // ── API keys ──────────────────────────────────────────────────────────────
  @Roles('PLATFORM_ADMIN','PARTNER_ADMIN')
  @Post(':id/regen-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Regenerate API key (prod or sandbox)' })
  regenKey(@Param('id') id: string, @Body() body: { env?: 'prod' | 'sandbox' }) {
    return firstValueFrom(this.svc.send(MSG.PARTNER_REGEN_KEY, { id, env: body.env || 'prod' }));
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  @Roles('PLATFORM_ADMIN','PARTNER_ADMIN')
  @Get(':id/stats')
  @ApiOperation({ summary: 'Partner analytics — policies sold, revenue, commissions' })
  stats(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.PARTNER_GET_STATS, { id }));
  }

  // ── Payouts ───────────────────────────────────────────────────────────────
  @Roles('PLATFORM_ADMIN','PARTNER_ADMIN')
  @Get(':id/payouts')
  @ApiOperation({ summary: 'List payouts for a partner' })
  listPayouts(@Param('id') partnerId: string) {
    return firstValueFrom(this.svc.send('partner.list_payouts', { partnerId }));
  }

  @Roles('PLATFORM_ADMIN')
  @Post(':id/payouts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create payout batch — admin only' })
  createPayout(@Param('id') partnerId: string, @Body() body: { amount: number; period: string; notes?: string }) {
    return firstValueFrom(this.svc.send('partner.create_payout', { partnerId, ...body }));
  }

  @Roles('PLATFORM_ADMIN')
  @Post('payouts/:payoutId/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark payout as completed — admin only' })
  confirmPayout(@Param('payoutId') id: string) {
    return firstValueFrom(this.svc.send('partner.confirm_payout', { id }));
  }

  // ── API usage & webhooks ──────────────────────────────────────────────────
  @Roles('PLATFORM_ADMIN','PARTNER_ADMIN')
  @Get(':id/api-usage')
  @ApiOperation({ summary: 'API usage summary for a partner' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  apiUsage(@Param('id') partnerId: string, @Query('days') days = 30) {
    return firstValueFrom(this.svc.send('partner.api_usage_summary', { partnerId, days: +days }));
  }

  @Roles('PLATFORM_ADMIN','PARTNER_ADMIN')
  @Get(':id/webhooks')
  @ApiOperation({ summary: 'Webhook delivery logs for a partner' })
  webhookLogs(@Param('id') partnerId: string) {
    return firstValueFrom(this.svc.send('partner.webhook_logs', { partnerId }));
  }
}

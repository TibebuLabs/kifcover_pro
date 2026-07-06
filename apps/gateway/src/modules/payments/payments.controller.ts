import { Controller, Post, Get, Param, Body, Inject, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiParam, ApiBody,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { InitiatePaymentDto, ConfirmPaymentDto } from '../../dto';

@ApiTags('💳 Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(@Inject('PAYMENTS_SERVICE') private readonly svc: ClientProxy) {}

  // ── Initiate payment ──────────────────────────────────────────────────────

  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initiate a payment (Telebirr, Bank, Card)',
    description: 'Creates a pending payment and returns a checkoutUrl to redirect the user to.',
  })
  @ApiBody({ type: InitiatePaymentDto })
  @ApiResponse({ status: 201, description: '{ payment, checkoutUrl }' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  initiate(@Body() dto: InitiatePaymentDto) {
    return firstValueFrom(this.svc.send(MSG.PAYMENT_INITIATE, dto));
  }

  // ── Confirm payment ───────────────────────────────────────────────────────

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm payment via provider callback',
    description: 'Marks the payment as COMPLETED and stores the provider transaction reference.',
  })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiBody({ type: ConfirmPaymentDto })
  @ApiResponse({ status: 200, description: 'Payment marked as COMPLETED' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  confirm(@Param('id') id: string, @Body() dto: ConfirmPaymentDto) {
    return firstValueFrom(this.svc.send(MSG.PAYMENT_CONFIRM, { id, ...dto }));
  }

  // ── Get payments by policy ────────────────────────────────────────────────

  @Get('policy/:policyId')
  @ApiOperation({ summary: 'Get all payments for a policy' })
  @ApiParam({ name: 'policyId', description: 'Policy UUID' })
  @ApiResponse({ status: 200, description: 'Array of Payment objects ordered by createdAt desc' })
  findByPolicy(@Param('policyId') policyId: string) {
    return firstValueFrom(this.svc.send(MSG.PAYMENT_FIND_BY_POLICY, { policyId }));
  }
}

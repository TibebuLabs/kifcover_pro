import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InitiatePaymentDto, ConfirmPaymentDto } from './dto/payment.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a payment (Telebirr, Bank, Card)' })
  initiate(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiate(dto);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm payment via provider callback' })
  confirm(@Param('id') id: string, @Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirm(id, dto.providerRef);
  }

  @Get('policy/:policyId')
  @ApiOperation({ summary: 'Get payments for a policy' })
  findByPolicy(@Param('policyId') policyId: string) {
    return this.paymentsService.findByPolicy(policyId);
  }
}

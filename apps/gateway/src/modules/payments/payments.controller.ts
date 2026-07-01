import { Controller, Post, Get, Param, Body, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { JwtGatewayGuard } from '../../guards/jwt-gateway.guard';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtGatewayGuard)
@Controller('payments')
export class PaymentsController {
  constructor(@Inject('PAYMENTS_SERVICE') private readonly svc: ClientProxy) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a payment' })
  initiate(@Body() body: any) {
    return firstValueFrom(this.svc.send(MSG.PAYMENT_INITIATE, body));
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm payment via provider callback' })
  confirm(@Param('id') id: string, @Body() body: { providerRef: string }) {
    return firstValueFrom(this.svc.send(MSG.PAYMENT_CONFIRM, { id, ...body }));
  }

  @Get('policy/:policyId')
  @ApiOperation({ summary: 'Get payments for a policy' })
  findByPolicy(@Param('policyId') policyId: string) {
    return firstValueFrom(this.svc.send(MSG.PAYMENT_FIND_BY_POLICY, { policyId }));
  }
}

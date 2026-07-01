import { Controller, Post, Get, Patch, Param, Body, Inject, UseGuards, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';
import { JwtGatewayGuard } from '../../guards/jwt-gateway.guard';

@ApiTags('KYC')
@ApiBearerAuth()
@UseGuards(JwtGatewayGuard)
@Controller('kyc')
export class KycController {
  constructor(@Inject('KYC_SERVICE') private readonly svc: ClientProxy) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a KYC document' })
  upload(@Request() req: any, @Body() body: { type: string; fileUrl: string; ocrData?: any }) {
    return firstValueFrom(this.svc.send(MSG.KYC_UPLOAD, { userId: req.user.id, ...body }));
  }

  @Get('status')
  @ApiOperation({ summary: 'Get my KYC status' })
  status(@Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.KYC_GET_STATUS, { userId: req.user.id }));
  }

  @Roles('PLATFORM_ADMIN')
  @Patch(':userId/verify')
  @ApiOperation({ summary: 'Approve or reject KYC (admin)' })
  verify(@Param('userId') userId: string, @Body() body: { approved: boolean }) {
    return firstValueFrom(this.svc.send(MSG.KYC_VERIFY, { userId, ...body }));
  }
}

import { Controller, Post, Get, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('KYC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a KYC document' })
  upload(@Request() req: any, @Body() body: { type: string; fileUrl: string; ocrData?: any }) {
    return this.kycService.uploadDocument(req.user.id, body.type, body.fileUrl, body.ocrData);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get my KYC status' })
  status(@Request() req: any) {
    return this.kycService.getStatus(req.user.id);
  }

  @Patch(':userId/verify')
  @ApiOperation({ summary: 'Approve or reject KYC (admin)' })
  verify(@Param('userId') userId: string, @Body() body: { approved: boolean }) {
    return this.kycService.verify(userId, body.approved);
  }
}

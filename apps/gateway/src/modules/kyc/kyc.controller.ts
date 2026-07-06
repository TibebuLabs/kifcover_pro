import { Controller, Post, Get, Patch, Param, Body, Inject, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiParam, ApiBody,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';
import { UploadKycDocumentDto, VerifyKycDto } from '../../dto';

@ApiTags('🪪 KYC')
@ApiBearerAuth()
@Controller('kyc')
export class KycController {
  constructor(@Inject('KYC_SERVICE') private readonly svc: ClientProxy) {}

  // ── Upload KYC document ───────────────────────────────────────────────────

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload a KYC verification document',
    description: 'Accepted types: NATIONAL_ID, SELFIE, ADDRESS_PROOF, PASSPORT. Sets user KYC status to IN_PROGRESS.',
  })
  @ApiBody({ type: UploadKycDocumentDto })
  @ApiResponse({ status: 201, description: 'Document uploaded — KYC status set to IN_PROGRESS' })
  @ApiResponse({ status: 400, description: 'Invalid document type' })
  @ApiResponse({ status: 404, description: 'User not found' })
  upload(@Request() req: any, @Body() dto: UploadKycDocumentDto) {
    return firstValueFrom(this.svc.send(MSG.KYC_UPLOAD, { userId: req.user.id, ...dto }));
  }

  // ── Get KYC status ────────────────────────────────────────────────────────

  @Get('status')
  @ApiOperation({ summary: 'Get own KYC verification status and uploaded documents' })
  @ApiResponse({ status: 200, description: '{ kycStatus, documents[] }' })
  status(@Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.KYC_GET_STATUS, { userId: req.user.id }));
  }

  // ── Admin verify/reject KYC ───────────────────────────────────────────────

  @Roles('PLATFORM_ADMIN')
  @Patch(':userId/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve or reject a KYC submission — admin only',
    description: 'Sets user KYC status to VERIFIED or REJECTED and updates all pending documents.',
  })
  @ApiParam({ name: 'userId', description: 'User UUID to verify' })
  @ApiBody({ type: VerifyKycDto })
  @ApiResponse({ status: 200, description: '{ id, kycStatus, email }' })
  @ApiResponse({ status: 403, description: 'Requires PLATFORM_ADMIN role' })
  @ApiResponse({ status: 404, description: 'User not found' })
  verify(@Param('userId') userId: string, @Body() dto: VerifyKycDto) {
    return firstValueFrom(this.svc.send(MSG.KYC_VERIFY, { userId, ...dto }));
  }
}

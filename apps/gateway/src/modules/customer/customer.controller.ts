import {
  Controller, Get, Post, Patch, Param, Body, Query,
  Inject, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import {
  IsString, IsUUID, IsNumber, IsPositive, IsDateString,
  IsArray, IsIn, IsOptional, MinLength, IsObject, IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';

// ── DTOs ──────────────────────────────────────────────────────────────────────

class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
}

class GenerateQuoteDto {
  @ApiProperty() @IsUUID() productId: string;
  @ApiProperty({ example: { age: 32, vehicleAge: 2 } }) @IsObject() metadata: Record<string, unknown>;
}

class IssuePolicyDto {
  @ApiProperty() @IsUUID() quoteId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() partnerId?: string;
}

class SubmitClaimDto {
  @ApiProperty() @IsUUID() policyId: string;
  @ApiProperty({ minLength: 20 }) @IsString() @MinLength(20) description: string;
  @ApiProperty() @IsDateString() incidentDate: string;
  @ApiProperty() @IsNumber() @IsPositive() @Type(() => Number) claimAmount: number;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) documents?: string[];
}

class ReviewClaimDto {
  @ApiProperty({ enum: ['UNDER_REVIEW','APPROVED','REJECTED','PAID'] })
  @IsIn(['UNDER_REVIEW','APPROVED','REJECTED','PAID']) status: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) approvedAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() adminNotes?: string;
}

class InitiatePaymentDto {
  @ApiPropertyOptional() @IsOptional() @IsString() policyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() claimId?: string;
  @ApiProperty() @IsNumber() @IsPositive() @Type(() => Number) amount: number;
  @ApiProperty({ enum: ['TELEBIRR','BANK','CARD'] }) @IsIn(['TELEBIRR','BANK','CARD']) provider: string;
}

class UploadKycDto {
  @ApiProperty({ enum: ['NATIONAL_ID','SELFIE','ADDRESS_PROOF','PASSPORT'] })
  @IsIn(['NATIONAL_ID','SELFIE','ADDRESS_PROOF','PASSPORT']) type: string;
  @ApiProperty() @IsString() fileUrl: string;
  @ApiPropertyOptional() @IsOptional() ocrData?: any;
}

// ── Controller ────────────────────────────────────────────────────────────────

@ApiTags('👤 Customer')
@ApiBearerAuth()
@Controller()
export class CustomerController {
  constructor(@Inject('CUSTOMER_SERVICE') private readonly svc: ClientProxy) {}

  // ── User profile ──────────────────────────────────────────────────────────
  @Get('users/me')
  @ApiOperation({ summary: 'Get own profile' })
  getMe(@Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.USER_FIND_BY_ID, { id: req.user.id }));
  }

  @Patch('users/me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update own profile' })
  updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return firstValueFrom(this.svc.send(MSG.USER_UPDATE, { id: req.user.id, ...dto }));
  }

  // ── KYC ───────────────────────────────────────────────────────────────────
  @Post('kyc/upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload KYC document' })
  kycUpload(@Request() req: any, @Body() dto: UploadKycDto) {
    return firstValueFrom(this.svc.send(MSG.KYC_UPLOAD, { userId: req.user.id, ...dto }));
  }

  @Get('kyc/status')
  @ApiOperation({ summary: 'Get own KYC status and uploaded documents' })
  kycStatus(@Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.KYC_GET_STATUS, { userId: req.user.id }));
  }

  // ── Products (public) ─────────────────────────────────────────────────────
  @Public()
  @Get('products')
  @ApiOperation({ summary: 'Browse available insurance products (public)' })
  @ApiQuery({ name: 'category', required: false, enum: ['AUTO','HEALTH','TRAVEL','GADGET','LIFE','AGRICULTURE','SME'] })
  findProducts(@Query('category') category?: string) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_FIND_ALL, { category }));
  }

  @Public()
  @Get('products/:id')
  @ApiOperation({ summary: 'Get product details (public)' })
  findOneProduct(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_FIND_ONE, { id }));
  }

  // ── Quotes ────────────────────────────────────────────────────────────────
  @Public()
  @Post('quotes/generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate a personalised quote' })
  generateQuote(@Body() dto: GenerateQuoteDto, @Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.QUOTE_GENERATE, { ...dto, userId: req.user?.id }));
  }

  @Get('quotes/:id')
  @ApiOperation({ summary: 'Get quote by ID' })
  findQuote(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.QUOTE_FIND_BY_ID, { id }));
  }

  // ── Policies ──────────────────────────────────────────────────────────────
  @Post('policies/issue')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Convert quote to active policy (requires KYC verified)' })
  issuePolicy(@Request() req: any, @Body() dto: IssuePolicyDto) {
    return firstValueFrom(this.svc.send(MSG.POLICY_ISSUE, { userId: req.user.id, ...dto }));
  }

  @Get('policies/my')
  @ApiOperation({ summary: 'Get my policies' })
  myPolicies(@Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.POLICY_FIND_BY_USER, { userId: req.user.id }));
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get policy by ID' })
  async findPolicy(@Param('id') id: string, @Request() req: any) {
    const policy = await firstValueFrom(this.svc.send(MSG.POLICY_FIND_BY_ID, { id }));
    const isPrivileged = ['PLATFORM_ADMIN', 'INSURANCE_PROVIDER', 'PARTNER_ADMIN'].includes(req.user.role);
    if (!isPrivileged && policy.userId !== req.user.id) {
      return { statusCode: 403, message: 'Not authorized to view this policy' };
    }
    return policy;
  }

  @Post('policies/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a policy' })
  cancelPolicy(@Param('id') id: string, @Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.POLICY_CANCEL, { id, userId: req.user.id, userRole: req.user.role }));
  }

  @Post('policies/:id/renew')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Renew an expiring policy' })
  renewPolicy(@Param('id') id: string, @Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.POLICY_RENEW, { id, userId: req.user.id }));
  }

  // ── Claims ────────────────────────────────────────────────────────────────
  @Post('claims')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a new claim' })
  submitClaim(@Request() req: any, @Body() dto: SubmitClaimDto) {
    return firstValueFrom(this.svc.send(MSG.CLAIM_SUBMIT, { userId: req.user.id, ...dto }));
  }

  @Get('claims/my')
  @ApiOperation({ summary: 'Get my claims' })
  myClaims(@Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.CLAIM_FIND_BY_USER, { userId: req.user.id }));
  }

  @Get('claims/:id')
  @ApiOperation({ summary: 'Get claim by ID' })
  findClaim(@Param('id') id: string, @Request() req: any) {
    const isPrivileged = ['PLATFORM_ADMIN','INSURANCE_PROVIDER','PARTNER_ADMIN'].includes(req.user.role);
    return firstValueFrom(this.svc.send(MSG.CLAIM_FIND_BY_ID, {
      id, requestingUserId: isPrivileged ? undefined : req.user.id,
    }));
  }

  @Roles('PLATFORM_ADMIN','INSURANCE_PROVIDER')
  @Get('claims')
  @ApiOperation({ summary: 'List all claims — admin/insurer only' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  allClaims(@Query('page') page = 1, @Query('limit') limit = 20, @Query('status') status?: string) {
    return firstValueFrom(this.svc.send(MSG.CLAIM_FIND_ALL, { page: +page, limit: +limit, status }));
  }

  @Roles('PLATFORM_ADMIN','INSURANCE_PROVIDER')
  @Patch('claims/:id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Review a claim — admin/insurer only' })
  reviewClaim(@Param('id') id: string, @Body() dto: ReviewClaimDto) {
    return firstValueFrom(this.svc.send(MSG.CLAIM_REVIEW, { id, ...dto }));
  }

  // ── Payments ──────────────────────────────────────────────────────────────
  @Post('payments/initiate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate payment (Telebirr, Bank, Card)' })
  initiatePayment(@Request() req: any, @Body() dto: InitiatePaymentDto) {
    return firstValueFrom(this.svc.send(MSG.PAYMENT_INITIATE, { userId: req.user.id, ...dto }));
  }

  @Public()
  @Post('payments/:id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm payment — provider callback (public)' })
  confirmPayment(@Param('id') id: string, @Body() body: { providerRef: string }) {
    return firstValueFrom(this.svc.send(MSG.PAYMENT_CONFIRM, { id, providerRef: body.providerRef }));
  }

  @Get('payments/my')
  @ApiOperation({ summary: 'Get my payment history' })
  myPayments(@Request() req: any) {
    return firstValueFrom(this.svc.send('payment.find_by_user', { userId: req.user.id }));
  }

  @Roles('PLATFORM_ADMIN','INSURANCE_PROVIDER','PARTNER_ADMIN')
  @Get('payments/policy/:policyId')
  @ApiOperation({ summary: 'Payments for a specific policy — admin/insurer/partner only' })
  paymentsByPolicy(@Param('policyId') policyId: string) {
    return firstValueFrom(this.svc.send(MSG.PAYMENT_FIND_BY_POLICY, { policyId }));
  }

  // ── Admin user management (routed via customer service) ───────────────────
  @Roles('PLATFORM_ADMIN')
  @Get('users')
  @ApiOperation({ summary: 'List all users — admin only' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAllUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    return firstValueFrom(this.svc.send(MSG.USER_FIND_ALL, { page: +page, limit: +limit }));
  }

  @Roles('PLATFORM_ADMIN')
  @Patch('users/:id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user role — admin only' })
  changeRole(@Param('id') id: string, @Body() body: { role: string }) {
    return firstValueFrom(this.svc.send(MSG.USER_CHANGE_ROLE, { id, role: body.role }));
  }

  @Roles('PLATFORM_ADMIN')
  @Patch('users/:id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate/deactivate user — admin only' })
  toggleUser(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return firstValueFrom(this.svc.send(MSG.USER_DEACTIVATE, { id, isActive: body.isActive }));
  }

  // ── Admin policies ────────────────────────────────────────────────────────
  @Roles('PLATFORM_ADMIN','INSURANCE_PROVIDER','PARTNER_ADMIN')
  @Get('policies')
  @ApiOperation({ summary: 'List all policies — admin/insurer/partner' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'partnerId', required: false })
  allPolicies(
    @Query('page') page = 1, @Query('limit') limit = 20,
    @Query('status') status?: string, @Query('partnerId') partnerId?: string,
    @Request() req?: any,
  ) {
    const effectivePartnerId = req.user.role === 'PARTNER_ADMIN'
      ? (partnerId ?? req.user.partnerId)
      : partnerId;
    return firstValueFrom(this.svc.send(MSG.POLICY_FIND_ALL, { page: +page, limit: +limit, status, partnerId: effectivePartnerId }));
  }
}

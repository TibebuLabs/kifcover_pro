// ─── Shared request/response DTOs used across gateway controllers ─────────────
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsPositive, IsDateString,
         IsArray, IsIn, IsUUID, MinLength, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

// ─── Quote ───────────────────────────────────────────────────────────────────

export class GenerateQuoteDto {
  @ApiProperty({ description: 'Product ID to quote', example: 'uuid-here' })
  @IsString()
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Risk metadata (age, vehicleAge, hasPreExistingCondition, etc.)',
    example: { age: 32, vehicleAge: 2 },
  })
  @IsObject()
  metadata: Record<string, unknown>;
}

// ─── Policy ──────────────────────────────────────────────────────────────────

export class IssuePolicyDto {
  @ApiProperty({ description: 'Quote ID to convert to policy', example: 'uuid-here' })
  @IsString()
  @IsUUID()
  quoteId: string;

  @ApiPropertyOptional({ description: 'Partner ID if issued through a partner' })
  @IsOptional()
  @IsString()
  @IsUUID()
  partnerId?: string;
}

// ─── Claim ───────────────────────────────────────────────────────────────────

export class SubmitClaimDto {
  @ApiProperty({ description: 'Active policy ID', example: 'uuid-here' })
  @IsString()
  @IsUUID()
  policyId: string;

  @ApiProperty({ description: 'Description of the incident (min 20 chars)', minLength: 20 })
  @IsString()
  @MinLength(20)
  description: string;

  @ApiProperty({ description: 'Date of the incident (ISO 8601)', example: '2025-06-01' })
  @IsDateString()
  incidentDate: string;

  @ApiProperty({ description: 'Claimed amount in ETB', example: 15000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  claimAmount: number;

  @ApiPropertyOptional({ description: 'Array of document URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];
}

export class ReviewClaimDto {
  @ApiProperty({ enum: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'] })
  @IsString()
  @IsIn(['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'])
  status: string;

  @ApiPropertyOptional({ description: 'Approved payout amount in ETB' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  approvedAmount?: number;

  @ApiPropertyOptional({ description: 'Admin notes on the decision' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export class InitiatePaymentDto {
  @ApiPropertyOptional({ description: 'Policy ID for premium payment' })
  @IsOptional()
  @IsString()
  policyId?: string;

  @ApiPropertyOptional({ description: 'Claim ID for claim payout' })
  @IsOptional()
  @IsString()
  claimId?: string;

  @ApiProperty({ description: 'Amount in ETB', example: 1200 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ enum: ['telebirr', 'bank', 'card'], description: 'Payment provider' })
  @IsString()
  @IsIn(['telebirr', 'bank', 'card'])
  provider: string;
}

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Provider transaction reference', example: 'TB-REF-12345' })
  @IsString()
  providerRef: string;
}

// ─── KYC ─────────────────────────────────────────────────────────────────────

export class UploadKycDocumentDto {
  @ApiProperty({ enum: ['NATIONAL_ID', 'SELFIE', 'ADDRESS_PROOF', 'PASSPORT'] })
  @IsString()
  @IsIn(['NATIONAL_ID', 'SELFIE', 'ADDRESS_PROOF', 'PASSPORT'])
  type: string;

  @ApiProperty({ description: 'URL of the uploaded document', example: 'https://storage.kifcover.et/docs/example.jpg' })
  @IsString()
  fileUrl: string;

  @ApiPropertyOptional({ description: 'OCR data extracted from the document' })
  @IsOptional()
  ocrData?: Record<string, unknown>;
}

export class VerifyKycDto {
  @ApiProperty({ description: 'Approve (true) or reject (false) the KYC submission' })
  approved: boolean;
}

// ─── Partner ──────────────────────────────────────────────────────────────────

export class CreatePartnerDto {
  @ApiProperty({ example: 'Acme Fintech', description: 'Partner company name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'acme-fintech', description: 'Unique URL-safe slug' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'https://partner.example.com/webhook' })
  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export class CreateProductDto {
  @ApiProperty({ example: 'Auto Comprehensive' }) @IsString() name: string;
  @ApiProperty({ example: 'Full vehicle protection...' }) @IsString() description: string;
  @ApiProperty({ enum: ['AUTO','HEALTH','TRAVEL','GADGET','LIFE','AGRICULTURE'] })
  @IsString() @IsIn(['AUTO','HEALTH','TRAVEL','GADGET','LIFE','AGRICULTURE'])
  category: string;
  @ApiProperty({ example: 1200, description: 'Base price in ETB' }) @IsNumber() @IsPositive() @Type(() => Number) basePrice: number;
  @ApiProperty({ example: 500000 }) @IsNumber() @IsPositive() @Type(() => Number) coverageAmount: number;
  @ApiProperty({ example: 365, description: 'Duration in days' }) @IsNumber() @IsPositive() @Type(() => Number) durationDays: number;
  @ApiProperty({ example: ['Theft', 'Accident'], type: [String] }) @IsArray() @IsString({ each: true }) features: string[];
}

// ─── User update ─────────────────────────────────────────────────────────────

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Abebe' }) @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional({ example: 'Kebede' }) @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional({ example: '+251911234567' }) @IsOptional() @IsString() phone?: string;
}

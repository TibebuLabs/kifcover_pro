import { IsString, IsOptional, IsNumber, IsPositive, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class InitiatePaymentDto {
  @ApiProperty({ required: false, description: 'Policy ID to pay for' })
  @IsOptional()
  @IsString()
  policyId?: string;

  @ApiProperty({ required: false, description: 'Claim ID for payout' })
  @IsOptional()
  @IsString()
  claimId?: string;

  @ApiProperty({ description: 'Amount in ETB', minimum: 1 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ enum: ['telebirr', 'bank', 'card'], description: 'Payment provider' })
  @IsString()
  @IsIn(['telebirr', 'bank', 'card'])
  provider: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Provider transaction reference' })
  @IsString()
  providerRef: string;
}

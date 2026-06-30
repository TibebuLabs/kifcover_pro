import { IsString, IsDateString, IsNumber, IsOptional, IsArray, IsPositive, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SubmitClaimDto {
  @ApiProperty({ description: 'Policy ID to claim against' })
  @IsString()
  policyId: string;

  @ApiProperty({ description: 'Description of the incident', minLength: 20 })
  @IsString()
  @MinLength(20, { message: 'Please provide a detailed description (at least 20 characters)' })
  description: string;

  @ApiProperty({ description: 'Date of the incident (ISO 8601)' })
  @IsDateString()
  incidentDate: string;

  @ApiProperty({ description: 'Claimed amount in ETB', minimum: 1 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  claimAmount: number;

  @ApiProperty({ description: 'Array of document URLs', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];
}

export class ReviewClaimDto {
  @ApiProperty({ enum: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'] })
  @IsString()
  status: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  approvedAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

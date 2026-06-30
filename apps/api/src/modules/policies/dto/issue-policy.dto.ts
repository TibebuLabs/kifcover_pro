import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IssuePolicyDto {
  @ApiProperty({ description: 'Quote ID to issue policy from' })
  @IsString()
  @IsUUID()
  quoteId: string;

  @ApiProperty({ required: false, description: 'Partner ID if issued via a partner' })
  @IsOptional()
  @IsString()
  @IsUUID()
  partnerId?: string;
}

import { IsString, IsOptional, IsUrl, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePartnerDto {
  @ApiProperty({ example: 'Acme Fintech' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'acme-fintech', description: 'URL-safe slug' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase alphanumeric with dashes only' })
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  webhookUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}

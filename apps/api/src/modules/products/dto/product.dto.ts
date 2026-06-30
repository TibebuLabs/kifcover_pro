import { IsString, IsEnum, IsNumber, IsInt, IsOptional, IsBoolean, IsArray, IsPositive, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export enum ProductCategory {
  AUTO = 'AUTO',
  HEALTH = 'HEALTH',
  TRAVEL = 'TRAVEL',
  GADGET = 'GADGET',
  LIFE = 'LIFE',
  AGRICULTURE = 'AGRICULTURE',
}

export class CreateProductDto {
  @ApiProperty({ example: 'Auto Comprehensive' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'Full vehicle protection...' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ enum: ProductCategory })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({ example: 1200, description: 'Base price in ETB' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  basePrice: number;

  @ApiProperty({ example: 500000, description: 'Coverage amount in ETB' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  coverageAmount: number;

  @ApiProperty({ example: 365, description: 'Duration in days' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  durationDays: number;

  @ApiProperty({ example: ['Accident coverage', 'Theft protection'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

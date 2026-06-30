import { IsString, IsUUID, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateQuoteDto {
  @ApiProperty({ description: 'Product ID to quote' })
  @IsString()
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Risk metadata (age, vehicleAge, hasPreExistingCondition, etc.)',
    example: { age: 35, vehicleAge: 3 },
  })
  @IsObject()
  metadata: Record<string, unknown>;
}

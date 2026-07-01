import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Abebe' }) @IsString() firstName: string;
  @ApiProperty({ example: 'Kebede' }) @IsString() lastName: string;
  @ApiProperty({ example: 'user@example.com' }) @IsEmail() email: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password: string;
}

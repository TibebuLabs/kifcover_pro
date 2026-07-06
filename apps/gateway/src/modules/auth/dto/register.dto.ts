import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Abebe', description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Kebede', description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'abebe@example.com', description: 'Unique email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+251911234567', description: 'Ethiopian phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'SecurePass@2024', description: 'Min 8 characters', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}

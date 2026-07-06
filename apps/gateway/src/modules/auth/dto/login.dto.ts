import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'abebe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass@2024' })
  @IsString()
  password: string;
}

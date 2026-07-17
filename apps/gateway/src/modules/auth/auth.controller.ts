import { Controller, Post, Get, Body, Inject, Request, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { MSG } from '@kifcover/shared-types';
import { Public } from '../../decorators/public.decorator';

class RegisterDto {
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiPropertyOptional({ enum: ['CUSTOMER', 'PARTNER_ADMIN', 'INSURANCE_PROVIDER'] })
  @IsOptional()
  @IsString()
  @IsIn(['CUSTOMER', 'PARTNER_ADMIN', 'INSURANCE_PROVIDER'])
  role?: string;
}

class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() password: string;
}

class SendOtpDto {
  @ApiProperty({ example: '0911234567' }) @IsString() phone: string;
}

class VerifyOtpDto {
  @ApiProperty() @IsString() phone: string;
  @ApiProperty() @IsString() code: string;
}

class CompleteProfileDto {
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
}

class ChangePasswordDto {
  @ApiProperty() @IsString() currentPassword: string;
  @ApiProperty() @IsString() @MinLength(8) newPassword: string;
}

@ApiTags('🔐 Auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly svc: ClientProxy) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register with email & password' })
  register(@Body() dto: RegisterDto) {
    return firstValueFrom(this.svc.send(MSG.AUTH_REGISTER, dto));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email & password → JWT' })
  login(@Body() dto: LoginDto) {
    return firstValueFrom(this.svc.send(MSG.AUTH_LOGIN, dto));
  }

  @Public()
  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  sendOtp(@Body() dto: SendOtpDto) {
    return firstValueFrom(this.svc.send(MSG.AUTH_SEND_OTP, dto));
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and receive JWT' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return firstValueFrom(this.svc.send(MSG.AUTH_VERIFY_OTP, dto));
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user from JWT' })
  getMe(@Request() req: any) {
    return req.user;
  }

  @ApiBearerAuth()
  @Post('complete-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete profile after first OTP login' })
  completeProfile(@Request() req: any, @Body() dto: CompleteProfileDto) {
    return firstValueFrom(this.svc.send(MSG.AUTH_COMPLETE_PROFILE, { id: req.user.id, ...dto }));
  }

  @ApiBearerAuth()
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return firstValueFrom(this.svc.send(MSG.AUTH_CHANGE_PASSWORD, { id: req.user.id, ...dto }));
  }
}

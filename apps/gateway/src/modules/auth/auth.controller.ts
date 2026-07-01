import { Controller, Post, Get, Body, Inject, Request, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Public } from '../../decorators/public.decorator';
import { JwtGatewayGuard } from '../../guards/jwt-gateway.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@UseGuards(JwtGatewayGuard)
@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly auth: ClientProxy) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  register(@Body() dto: RegisterDto) {
    return firstValueFrom(this.auth.send(MSG.AUTH_REGISTER, dto));
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email & password' })
  login(@Body() dto: LoginDto) {
    return firstValueFrom(this.auth.send(MSG.AUTH_LOGIN, dto));
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  getMe(@Request() req: any) {
    return req.user;
  }
}

import { Controller, Post, Get, Body, Inject, Request, HttpCode, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiBody,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Public } from '../../decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

function wrapRpc<T>(promise: Promise<T>): Promise<T> {
  return promise.catch((err) => {
    if (err?.constructor?.name === 'AggregateError' || err?.code === 'ECONNREFUSED') {
      throw new ServiceUnavailableException('Auth service is unavailable');
    }
    throw err;
  });
}

@ApiTags('🔐 Auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly auth: ClientProxy) {}

  // ── Register ─────────────────────────────────────────────────────────────

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new customer account',
    description: 'Creates a user account and returns a JWT access token.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Account created — returns accessToken + user profile' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  register(@Body() dto: RegisterDto) {
    return wrapRpc(firstValueFrom(this.auth.send(MSG.AUTH_REGISTER, dto)));
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email & password',
    description: 'Returns a signed JWT (7-day expiry) and the user profile.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful — { accessToken, user }' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return wrapRpc(firstValueFrom(this.auth.send(MSG.AUTH_LOGIN, dto)));
  }

  // ── Me ────────────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns { id, email, role } from JWT payload' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  getMe(@Request() req: any) {
    return req.user;
  }
}

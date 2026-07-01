import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(MSG.AUTH_REGISTER)
  register(@Payload() payload: any) {
    return this.authService.register(payload);
  }

  @MessagePattern(MSG.AUTH_LOGIN)
  login(@Payload() payload: { email: string; password: string }) {
    return this.authService.login(payload.email, payload.password);
  }

  @MessagePattern(MSG.AUTH_VERIFY_TOKEN)
  verifyToken(@Payload() payload: { token: string }) {
    return this.authService.verifyToken(payload.token);
  }
}

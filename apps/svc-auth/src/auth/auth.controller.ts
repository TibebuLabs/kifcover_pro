import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @MessagePattern(MSG.AUTH_REGISTER)
  register(@Payload() p: { firstName: string; lastName: string; email: string; phone?: string; password: string }) {
    return this.svc.register(p);
  }

  @MessagePattern(MSG.AUTH_LOGIN)
  login(@Payload() p: { email: string; password: string }) {
    return this.svc.login(p.email, p.password);
  }

  @MessagePattern(MSG.AUTH_VERIFY_TOKEN)
  verifyToken(@Payload() p: { token: string }) {
    return this.svc.verifyToken(p.token);
  }

  @MessagePattern('auth.send_otp')
  sendOtp(@Payload() p: { phone: string }) {
    return this.svc.sendOtp(p.phone);
  }

  @MessagePattern('auth.verify_otp')
  verifyOtp(@Payload() p: { phone: string; code: string }) {
    return this.svc.verifyOtp(p.phone, p.code);
  }

  @MessagePattern('auth.complete_profile')
  completeProfile(@Payload() p: { id: string; firstName: string; lastName: string; email?: string }) {
    return this.svc.completeProfile(p.id, p);
  }

  @MessagePattern('auth.change_password')
  changePassword(@Payload() p: { id: string; currentPassword: string; newPassword: string }) {
    return this.svc.changePassword(p.id, p.currentPassword, p.newPassword);
  }
}

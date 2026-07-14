import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ── Register (email+password) ─────────────────────────────────────────────
  async register(dto: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone ?? null,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
      },
    });

    const token = this._sign(user);
    return { accessToken: token, user: this._safe(user) };
  }

  // ── Login (email+password) ────────────────────────────────────────────────
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return { accessToken: this._sign(user), user: this._safe(user) };
  }

  // ── OTP: send ─────────────────────────────────────────────────────────────
  async sendOtp(phone: string) {
    // In production this calls Telebirr SMS API
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await this.prisma.otpCode.create({ data: { phone, code, expiresAt } });

    // TODO: integrate Telebirr SMS — for now return code in dev
    return { message: 'OTP sent', ...(process.env.NODE_ENV !== 'production' && { code }) };
  }

  // ── OTP: verify ───────────────────────────────────────────────────────────
  async verifyOtp(phone: string, code: string) {
    const otp = await this.prisma.otpCode.findFirst({
      where: { phone, code, used: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) throw new BadRequestException('Invalid OTP');
    if (new Date() > otp.expiresAt) throw new BadRequestException('OTP expired');

    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });

    // Find or create user by phone
    let user = await this.prisma.user.findFirst({ where: { phone } });
    const isNew = !user;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: `${phone}@kifcover.et`,
          phone,
          firstName: '',
          lastName: '',
          passwordHash: await bcrypt.hash(code, 8),
        },
      });
    }

    return {
      accessToken: this._sign(user),
      user: this._safe(user),
      isNewUser: isNew,
    };
  }

  // ── Verify JWT token ──────────────────────────────────────────────────────
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // ── Complete profile (after OTP signup) ──────────────────────────────────
  async completeProfile(id: string, data: {
    firstName: string;
    lastName: string;
    email?: string;
    nationalId?: string;
    dateOfBirth?: string;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (data.email && data.email !== user.email) {
      const emailTaken = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (emailTaken) throw new ConflictException('Email already in use');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        ...(data.email ? { email: data.email } : {}),
      },
    });
    return { user: this._safe(updated) };
  }

  // ── Change password ───────────────────────────────────────────────────────
  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { message: 'Password changed successfully' };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private _sign(user: any) {
    return this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
  }

  private _safe(user: any) {
    const { passwordHash: _, ...safe } = user;
    return safe;
  }
}

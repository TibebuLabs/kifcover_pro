import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<any> {
    const existing = await (this.prisma as any).user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await (this.prisma as any).user.create({
      data: {
        email:        dto.email,
        passwordHash,
        firstName:    dto.firstName,
        lastName:     dto.lastName,
        phone:        dto.phone ?? null,
      },
    });

    const { passwordHash: _, ...safe } = user;
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return {
      accessToken: token,
      user: {
        id:        safe.id,
        email:     safe.email,
        firstName: safe.firstName,
        lastName:  safe.lastName,
        phone:     safe.phone,
        role:      safe.role,
        kycStatus: safe.kycStatus,
        isActive:  safe.isActive,
      },
    };
  }

  async login(email: string, password: string): Promise<any> {
    const user = await (this.prisma as any).user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const { passwordHash: _, ...safe } = user;
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return {
      accessToken: token,
      user: {
        id:        safe.id,
        email:     safe.email,
        firstName: safe.firstName ?? '',
        lastName:  safe.lastName ?? '',
        phone:     safe.phone,
        role:      safe.role,
        kycStatus: safe.kycStatus ?? 'PENDING',
        isActive:  safe.isActive,
      },
    };
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

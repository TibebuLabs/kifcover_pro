import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip, take: safeLimit, orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, kycStatus: true, isActive: true, createdAt: true },
      }),
      this.prisma.user.count(),
    ]);
    return { data: users, total, page: safePage, limit: safeLimit };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, kycStatus: true, isActive: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: any) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: { firstName?: string; lastName?: string; phone?: string }) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id }, data,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, kycStatus: true, updatedAt: true },
    });
  }
}

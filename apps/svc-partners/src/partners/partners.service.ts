import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; slug: string; webhookUrl?: string; logoUrl?: string }) {
    const existing = await this.prisma.partner.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('A partner with this slug already exists');
    return this.prisma.partner.create({ data });
  }

  findAll() {
    return this.prisma.partner.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async getStats(id: string) {
    await this.findById(id);
    const [totalPolicies, revenue, activePolicies] = await Promise.all([
      this.prisma.policy.count({ where: { partnerId: id } }),
      this.prisma.policy.aggregate({ where: { partnerId: id }, _sum: { premium: true } }),
      this.prisma.policy.count({ where: { partnerId: id, status: 'ACTIVE' } }),
    ]);
    return {
      totalPolicies,
      totalRevenue: revenue._sum.premium ?? 0,
      activePolicies,
    };
  }

  async regenerateApiKey(id: string) {
    await this.findById(id);
    const newKey = `kif_${randomBytes(16).toString('hex')}`;
    return this.prisma.partner.update({ where: { id }, data: { apiKey: newKey } });
  }
}

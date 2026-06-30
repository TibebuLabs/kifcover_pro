import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePartnerDto } from './dto/partner.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePartnerDto) {
    const existing = await this.prisma.partner.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('A partner with this slug already exists');
    return this.prisma.partner.create({ data: dto });
  }

  async findAll() {
    return this.prisma.partner.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async findByApiKey(apiKey: string) {
    return this.prisma.partner.findUnique({ where: { apiKey } });
  }

  async getStats(partnerId: string) {
    await this.findById(partnerId); // 404 if not found
    const [totalPolicies, totalRevenue, activePolicies] = await Promise.all([
      this.prisma.policy.count({ where: { partnerId } }),
      this.prisma.policy.aggregate({ where: { partnerId }, _sum: { premium: true } }),
      this.prisma.policy.count({ where: { partnerId, status: 'ACTIVE' } }),
    ]);
    return {
      totalPolicies,
      totalRevenue: totalRevenue._sum.premium ?? 0,
      activePolicies,
    };
  }

  async regenerateApiKey(id: string) {
    await this.findById(id); // 404 if not found
    const newKey = `kif_${randomBytes(16).toString('hex')}`;
    return this.prisma.partner.update({ where: { id }, data: { apiKey: newKey } });
  }
}

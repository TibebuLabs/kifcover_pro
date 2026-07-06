import { Injectable, NotFoundException, ConflictException, Inject, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { MSG } from '@kifcover/shared-types';

@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('POLICIES_SERVICE') private readonly policiesSvc: ClientProxy,
  ) {}

  async create(data: { name: string; slug: string; webhookUrl?: string; logoUrl?: string }): Promise<any> {
    const existing = await this.prisma.partner.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('A partner with this slug already exists');
    return this.prisma.partner.create({ data });
  }

  findAll(): Promise<any[]> {
    return this.prisma.partner.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string): Promise<any> {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async getStats(id: string): Promise<any> {
    await this.findById(id);
    // Fetch stats from svc-policies via TCP
    try {
      const result = await firstValueFrom(
        this.policiesSvc.send(MSG.POLICY_FIND_ALL, { page: 1, limit: 1000, partnerId: id }).pipe(
          timeout(5000),
          catchError(() => throwError(() => new InternalServerErrorException('Policies service unavailable'))),
        ),
      );
      const policies: any[] = (result as any).data ?? [];
      const activePolicies = policies.filter((p) => p.status === 'ACTIVE').length;
      const totalRevenue = policies.reduce((sum, p) => sum + (p.premium ?? 0), 0);
      return { totalPolicies: policies.length, totalRevenue, activePolicies };
    } catch {
      return { totalPolicies: 0, totalRevenue: 0, activePolicies: 0 };
    }
  }

  async regenerateApiKey(id: string): Promise<any> {
    await this.findById(id);
    const newKey = `kif_${randomBytes(16).toString('hex')}`;
    return this.prisma.partner.update({ where: { id }, data: { apiKey: newKey } });
  }
}

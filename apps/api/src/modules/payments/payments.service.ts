import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async initiate(data: { policyId?: string; claimId?: string; amount: number; provider: string; metadata?: any }) {
    // In production: integrate with Telebirr / Bank API here
    const payment = await this.prisma.payment.create({
      data: {
        policyId: data.policyId,
        claimId: data.claimId,
        amount: data.amount,
        provider: data.provider,
        status: 'PENDING',
        metadata: data.metadata || {},
      },
    });
    // Simulate provider reference
    return { ...payment, checkoutUrl: `https://pay.kifcover.et/checkout/${payment.id}` };
  }

  async confirm(id: string, providerRef: string) {
    return this.prisma.payment.update({
      where: { id },
      data: { status: 'COMPLETED', providerRef },
    });
  }

  async findByPolicy(policyId: string) {
    return this.prisma.payment.findMany({ where: { policyId }, orderBy: { createdAt: 'desc' } });
  }
}

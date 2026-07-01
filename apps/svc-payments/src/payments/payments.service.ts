import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async initiate(data: { policyId?: string; claimId?: string; amount: number; provider: string; metadata?: any }) {
    const payment = await this.prisma.payment.create({
      data: {
        policyId:  data.policyId,
        claimId:   data.claimId,
        amount:    data.amount,
        provider:  data.provider,
        status:    'PENDING',
        metadata:  data.metadata ?? {},
      },
    });
    // Checkout URL — replace with real Telebirr/bank SDK integration
    return { ...payment, checkoutUrl: `https://pay.kifcover.et/checkout/${payment.id}` };
  }

  async confirm(id: string, providerRef: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return this.prisma.payment.update({
      where: { id },
      data: { status: 'COMPLETED', providerRef },
    });
  }

  findByPolicy(policyId: string) {
    return this.prisma.payment.findMany({
      where: { policyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

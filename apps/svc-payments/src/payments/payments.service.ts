import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Gateway sends lowercase provider names; schema uses uppercase enum
const providerMap: Record<string, string> = {
  telebirr: 'TELEBIRR',
  bank:     'BANK',
  card:     'CARD',
  TELEBIRR: 'TELEBIRR',
  BANK:     'BANK',
  CARD:     'CARD',
};

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async initiate(data: {
    userId?: string;
    policyId?: string;
    claimId?: string;
    amount: number;
    provider: string;
    metadata?: any;
  }): Promise<any> {
    const payment = await (this.prisma as any).payment.create({
      data: {
        userId:   data.userId ?? 'anonymous',
        policyId: data.policyId ?? null,
        claimId:  data.claimId ?? null,
        amount:   data.amount,
        provider: providerMap[data.provider] ?? 'TELEBIRR',
        status:   'PENDING',
        metadata: data.metadata ?? {},
      },
    });
    return { ...payment, checkoutUrl: `https://pay.kifcover.et/checkout/${payment.id}` };
  }

  async confirm(id: string, providerRef: string): Promise<any> {
    const payment = await (this.prisma as any).payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return (this.prisma as any).payment.update({
      where: { id },
      data: { status: 'COMPLETED', providerRef },
    });
  }

  findByPolicy(policyId: string): Promise<any[]> {
    return (this.prisma as any).payment.findMany({
      where: { policyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

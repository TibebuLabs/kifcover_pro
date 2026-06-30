import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IssuePolicyDto } from './dto/issue-policy.dto';

@Injectable()
export class PoliciesService {
  constructor(private readonly prisma: PrismaService) {}

  async issuePolicy(userId: string, dto: IssuePolicyDto) {
    // Verify quote exists and hasn't expired
    const quote = await this.prisma.quote.findUnique({
      where: { id: dto.quoteId },
      include: { product: true, policy: true },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    if (new Date() > quote.expiresAt) {
      throw new BadRequestException('Quote has expired. Please generate a new quote.');
    }
    if (quote.policy) {
      throw new BadRequestException('This quote has already been converted to a policy.');
    }

    // Verify user KYC
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { kycStatus: true } });
    if (!user || user.kycStatus !== 'VERIFIED') {
      throw new BadRequestException('KYC verification required before purchasing a policy.');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + quote.product.durationDays);

    const policy = await this.prisma.policy.create({
      data: {
        userId,
        productId: quote.productId,
        quoteId: dto.quoteId,
        partnerId: dto.partnerId,
        premium: quote.premium,
        coverageAmount: quote.coverageAmount,
        startDate,
        endDate,
        status: 'ACTIVE',
        qrCode: `KIF-${Date.now()}`,
      },
      include: {
        product: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return policy;
  }

  async findByUser(userId: string) {
    return this.prisma.policy.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const policy = await this.prisma.policy.findUnique({
      where: { id },
      include: {
        product: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        claims: true,
      },
    });
    if (!policy) throw new NotFoundException('Policy not found');
    return policy;
  }

  async findAll(page = 1, limit = 20, status?: string, partnerId?: string) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (partnerId) where.partnerId = partnerId;

    const [policies, total] = await Promise.all([
      this.prisma.policy.findMany({
        where,
        skip,
        take: safeLimit,
        include: {
          product: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.policy.count({ where }),
    ]);
    return { policies, total, page: safePage, limit: safeLimit };
  }
}

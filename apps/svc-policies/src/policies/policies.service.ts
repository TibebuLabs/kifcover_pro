import { Injectable, NotFoundException, BadRequestException, Inject, Logger, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { MSG } from '@kifcover/shared-types';
import { PolicyStatus } from '@prisma/client';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('USERS_SERVICE') private readonly usersSvc: ClientProxy,
  ) {}

  async issue(userId: string, quoteId: string, partnerId?: string) {
    // Verify quote
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { product: true, policy: true },
    });
    if (!quote)       throw new NotFoundException('Quote not found');
    if (new Date() > quote.expiresAt) throw new BadRequestException('Quote has expired');
    if (quote.policy) throw new BadRequestException('Quote already converted to a policy');

    // Verify KYC via users service — 5s timeout to avoid hanging
    let user: { kycStatus: string } | null = null;
    try {
      user = await firstValueFrom(
        this.usersSvc.send<{ kycStatus: string }>(MSG.USER_FIND_BY_ID, { id: userId }).pipe(
          timeout(5000),
          catchError((err) => throwError(() => new InternalServerErrorException('User service unavailable'))),
        ),
      );
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to verify user KYC status');
    }

    if (!user || user.kycStatus !== 'VERIFIED') {
      throw new BadRequestException('KYC verification required before purchasing a policy');
    }

    const startDate = new Date();
    const endDate   = new Date();
    endDate.setDate(endDate.getDate() + quote.product.durationDays);

    return this.prisma.policy.create({
      data: {
        userId, productId: quote.productId, quoteId,
        partnerId, premium: quote.premium, coverageAmount: quote.coverageAmount,
        startDate, endDate, status: PolicyStatus.ACTIVE,
        qrCode: `KIF-${Date.now()}`,
      },
      include: {
        product: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.policy.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const policy = await this.prisma.policy.findUnique({
      where: { id },
      include: { product: true, user: { select: { id: true, firstName: true, lastName: true, email: true } }, claims: true },
    });
    if (!policy) throw new NotFoundException('Policy not found');
    return policy;
  }

  async findAll(page = 1, limit = 20, status?: string, partnerId?: string) {
    const safePage  = Math.max(1, page);
    const safeLimit = Math.min(100, limit);
    const skip      = (safePage - 1) * safeLimit;
    const where: any = {};
    if (status)    where.status    = status;
    if (partnerId) where.partnerId = partnerId;

    const [data, total] = await Promise.all([
      this.prisma.policy.findMany({
        where, skip, take: safeLimit,
        include: { product: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.policy.count({ where }),
    ]);
    return { data, total, page: safePage, limit: safeLimit };
  }
}

import {
  Injectable, NotFoundException, BadRequestException,
  Inject, InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { MSG } from '@kifcover/shared-types';
import { PolicyStatus } from '../../../../node_modules/.prisma/svc-policies-client';

@Injectable()
export class PoliciesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('USERS_SERVICE')  private readonly usersSvc: ClientProxy,
    @Inject('QUOTES_SERVICE') private readonly quotesSvc: ClientProxy,
  ) {}

  async issue(userId: string, quoteId: string, partnerId?: string): Promise<any> {
    // ── 1. Fetch quote from svc-quotes ───────────────────────────────────
    let quote: any;
    try {
      quote = await firstValueFrom(
        this.quotesSvc.send(MSG.QUOTE_FIND_BY_ID, { id: quoteId }).pipe(
          timeout(5000),
          catchError(() => throwError(() => new InternalServerErrorException('Quotes service unavailable'))),
        ),
      );
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to fetch quote');
    }

    if (!quote)                        throw new NotFoundException('Quote not found');
    if (new Date() > new Date(quote.expiresAt)) throw new BadRequestException('Quote has expired');

    // Check quote not already used
    const existing = await this.prisma.policy.findFirst({ where: { quoteId } });
    if (existing) throw new BadRequestException('Quote already converted to a policy');

    // ── 2. Verify KYC via svc-users ──────────────────────────────────────
    let user: { kycStatus: string } | null = null;
    try {
      user = await firstValueFrom(
        this.usersSvc.send<{ kycStatus: string }>(MSG.USER_FIND_BY_ID, { id: userId }).pipe(
          timeout(5000),
          catchError(() => throwError(() => new InternalServerErrorException('User service unavailable'))),
        ),
      );
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to verify KYC status');
    }

    if (!user || user.kycStatus !== 'VERIFIED') {
      throw new BadRequestException('KYC verification required before purchasing a policy');
    }

    // ── 3. Create policy ─────────────────────────────────────────────────
    const startDate = new Date();
    const endDate   = new Date();
    endDate.setDate(endDate.getDate() + (quote.product?.durationDays ?? 365));

    return this.prisma.policy.create({
      data: {
        userId,
        productId:     quote.productId,
        productName:   quote.product?.name ?? 'Insurance Policy',
        quoteId,
        partnerId:     partnerId ?? null,
        premium:       quote.premium,
        coverageAmount: quote.coverageAmount,
        startDate,
        endDate,
        status:  PolicyStatus.ACTIVE,
        qrCode:  `KIF-${Date.now()}`,
      },
    });
  }

  findByUser(userId: string): Promise<any[]> {
    return this.prisma.policy.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<any> {
    const policy = await this.prisma.policy.findUnique({ where: { id } });
    if (!policy) throw new NotFoundException('Policy not found');
    return policy;
  }

  async findAll(page = 1, limit = 20, status?: string, partnerId?: string): Promise<any> {
    const safePage  = Math.max(1, page);
    const safeLimit = Math.min(100, limit);
    const skip      = (safePage - 1) * safeLimit;
    const where: any = {};
    if (status)    where.status    = status;
    if (partnerId) where.partnerId = partnerId;

    const [data, total] = await Promise.all([
      this.prisma.policy.findMany({
        where, skip, take: safeLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.policy.count({ where }),
    ]);
    return { data, total, page: safePage, limit: safeLimit };
  }
}

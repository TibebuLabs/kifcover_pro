import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('INSURER_SERVICE') private readonly insurerClient: ClientProxy,
    @Inject('PARTNER_SERVICE') private readonly partnerClient: ClientProxy,
  ) {}

  // ─── Users ────────────────────────────────────────────────────────────────

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        kycStatus: true,
        isActive: true,
        partnerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          role: true,
          kycStatus: true,
          isActive: true,
          partnerId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        kycStatus: true,
        isActive: true,
        partnerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      kycStatus?: string;
      isActive?: boolean;
      partnerId?: string;
    },
  ) {
    await this.findById(id);
    return this.prisma.user.update({ where: { id }, data: data as any });
  }

  async changeRole(id: string, role: string) {
    await this.findById(id);
    return this.prisma.user.update({ where: { id }, data: { role: role as any } });
  }

  async deactivate(id: string, isActive: boolean) {
    await this.findById(id);
    return this.prisma.user.update({ where: { id }, data: { isActive } });
  }

  // ─── KYC ─────────────────────────────────────────────────────────────────

  async kycUpload(
    userId: string,
    type: string,
    fileUrl: string,
    ocrData?: any,
  ) {
    await this.findById(userId);

    await this.prisma.kycRecord.upsert({
      where: { userId },
      create: { userId, status: 'IN_PROGRESS' as any },
      update: { status: 'IN_PROGRESS' as any },
    });

    const doc = await this.prisma.kycDocument.create({
      data: {
        userId,
        type: type as any,
        fileUrl,
        ocrData: ocrData ?? undefined,
        status: 'PENDING' as any,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'IN_PROGRESS' as any },
    });

    return doc;
  }

  async kycGetStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const documents = await this.prisma.kycDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { kycStatus: user.kycStatus, documents };
  }

  async kycVerify(userId: string, approved: boolean) {
    const newStatus = approved ? ('VERIFIED' as any) : ('REJECTED' as any);

    await this.prisma.kycRecord.update({
      where: { userId },
      data: { status: newStatus },
    });

    await this.prisma.kycDocument.updateMany({
      where: { userId, status: 'PENDING' as any },
      data: { status: newStatus, reviewedAt: new Date() },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: newStatus },
    });

    return { userId, kycStatus: newStatus };
  }

  // ─── Quotes ───────────────────────────────────────────────────────────────

  async generateQuote(productId: string, metadata: any = {}, userId?: string) {
    let pricingResult: any;
    try {
      pricingResult = await firstValueFrom(
        this.insurerClient
          .send('insurer.calculate_premium', { productId, metadata })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throw new NotFoundException(`Product ${productId} not found or insurer service unavailable`);
    }

    if (!pricingResult) throw new NotFoundException(`Product ${productId} not found`);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const quote = await this.prisma.quote.create({
      data: {
        userId: userId ?? null,
        productId,
        productName: pricingResult.productName,
        premium: pricingResult.premium,
        coverageAmount: pricingResult.coverageAmount,
        durationDays: pricingResult.durationDays,
        metadata: metadata ?? {},
        expiresAt,
      },
    });

    return { quote, product: pricingResult.product };
  }

  async findQuoteById(id: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id } });
    if (!quote) throw new NotFoundException(`Quote ${id} not found`);
    return quote;
  }

  // ─── Policies ─────────────────────────────────────────────────────────────

  async issuePolicy(userId: string, quoteId: string, partnerId?: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id: quoteId } });
    if (!quote) throw new NotFoundException(`Quote ${quoteId} not found`);

    if (new Date() > quote.expiresAt) {
      throw new BadRequestException('Quote has expired');
    }

    const existing = await this.prisma.policy.findUnique({ where: { quoteId } });
    if (existing) throw new BadRequestException('Policy already issued for this quote');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    if (user.kycStatus !== 'VERIFIED') {
      throw new BadRequestException('User KYC must be verified before issuing policy');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + quote.durationDays);

    const policy = await this.prisma.policy.create({
      data: {
        userId,
        productId: quote.productId,
        productName: quote.productName,
        partnerId: partnerId ?? null,
        quoteId,
        status: 'ACTIVE' as any,
        premium: quote.premium,
        coverageAmount: quote.coverageAmount,
        startDate,
        endDate,
        qrCode: `KIF-${Date.now()}`,
      },
    });

    return policy;
  }

  async findPoliciesByUser(userId: string) {
    return this.prisma.policy.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPolicyById(id: string) {
    const policy = await this.prisma.policy.findUnique({ where: { id } });
    if (!policy) throw new NotFoundException(`Policy ${id} not found`);
    return policy;
  }

  async cancelPolicy(id: string, userId: string, userRole?: string) {
    const policy = await this.findPolicyById(id);
    const isPrivileged = userRole === 'PLATFORM_ADMIN' || userRole === 'INSURANCE_PROVIDER';
    if (!isPrivileged && policy.userId !== userId) {
      throw new BadRequestException('Not authorized to cancel this policy');
    }
    return this.prisma.policy.update({
      where: { id },
      data: { status: 'CANCELLED' as any },
    });
  }

  async renewPolicy(id: string, userId: string) {
    const oldPolicy = await this.findPolicyById(id);
    if (oldPolicy.userId !== userId) {
      throw new BadRequestException('Not authorized to renew this policy');
    }

    let pricingResult: any;
    try {
      pricingResult = await firstValueFrom(
        this.insurerClient
          .send('insurer.calculate_premium', { productId: oldPolicy.productId, metadata: {} })
          .pipe(timeout(5000)),
      );
    } catch {
      throw new BadRequestException('Insurer service unavailable for renewal');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pricingResult.durationDays);

    const policy = await this.prisma.policy.create({
      data: {
        userId,
        productId: oldPolicy.productId,
        productName: oldPolicy.productName,
        partnerId: oldPolicy.partnerId,
        status: 'ACTIVE' as any,
        premium: pricingResult.premium,
        coverageAmount: pricingResult.coverageAmount,
        startDate,
        endDate,
        qrCode: `KIF-${Date.now()}`,
      },
    });

    return policy;
  }

  async findAllPolicies(
    page = 1,
    limit = 20,
    status?: string,
    partnerId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (partnerId) where.partnerId = partnerId;

    const [data, total] = await Promise.all([
      this.prisma.policy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.policy.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // ─── Claims ───────────────────────────────────────────────────────────────

  async submitClaim(data: {
    userId: string;
    policyId: string;
    description: string;
    incidentDate: Date;
    claimAmount: number;
    documents?: any[];
  }) {
    const policy = await this.findPolicyById(data.policyId);

    if (policy.userId !== data.userId) {
      throw new BadRequestException('Policy does not belong to user');
    }
    if (policy.status !== 'ACTIVE') {
      throw new BadRequestException('Policy is not active');
    }

    const incidentDate = new Date(data.incidentDate);
    if (incidentDate < policy.startDate || incidentDate > policy.endDate) {
      throw new BadRequestException('Incident date is outside policy coverage period');
    }
    if (data.claimAmount > policy.coverageAmount) {
      throw new BadRequestException('Claim amount exceeds coverage amount');
    }

    return this.prisma.claim.create({
      data: {
        userId: data.userId,
        policyId: data.policyId,
        policyNumber: policy.policyNumber,
        description: data.description,
        incidentDate: incidentDate,
        claimAmount: data.claimAmount,
        documents: data.documents ?? [],
        status: 'SUBMITTED' as any,
      },
    });
  }

  async findClaimsByUser(userId: string) {
    return this.prisma.claim.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findClaimById(id: string, requestingUserId?: string) {
    const claim = await this.prisma.claim.findUnique({ where: { id } });
    if (!claim) throw new NotFoundException(`Claim ${id} not found`);
    if (requestingUserId && claim.userId !== requestingUserId) {
      throw new BadRequestException('Not authorized to view this claim');
    }
    return claim;
  }

  async findAllClaims(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.claim.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.claim.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async reviewClaim(
    id: string,
    newStatus: string,
    approvedAmount?: number,
    adminNotes?: string,
  ) {
    const claim = await this.findClaimById(id);

    // FSM transitions
    const allowedTransitions: Record<string, string[]> = {
      SUBMITTED: ['UNDER_REVIEW'],
      UNDER_REVIEW: ['APPROVED', 'REJECTED'],
      APPROVED: ['PAID'],
      REJECTED: [],
      PAID: [],
    };

    const allowed = allowedTransitions[claim.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition claim from ${claim.status} to ${newStatus}`,
      );
    }

    const updateData: any = { status: newStatus };
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (approvedAmount !== undefined) updateData.approvedAmount = approvedAmount;
    if (['APPROVED', 'REJECTED', 'PAID'].includes(newStatus)) {
      updateData.resolvedAt = new Date();
    }

    return this.prisma.claim.update({ where: { id }, data: updateData });
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  async initiatePayment(data: {
    policyId?: string;
    claimId?: string;
    userId: string;
    amount: number;
    currency?: string;
    provider: string;
    metadata?: any;
  }) {
    const payment = await this.prisma.payment.create({
      data: {
        policyId: data.policyId ?? null,
        claimId: data.claimId ?? null,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency ?? 'ETB',
        status: 'PENDING' as any,
        provider: data.provider as any,
        metadata: data.metadata ?? {},
        checkoutUrl: null,
      },
    });

    const checkoutUrl = `https://pay.kifcover.et/checkout/${payment.id}`;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { checkoutUrl },
    });

    return { payment: { ...payment, checkoutUrl }, checkoutUrl };
  }

  async confirmPayment(id: string, providerRef: string) {
    const payment = await this.prisma.payment.update({
      where: { id },
      data: { status: 'COMPLETED' as any, providerRef },
    });

    // Trigger commission calculation if linked to a policy
    if (payment.policyId) {
      try {
        await firstValueFrom(
          this.partnerClient
            .send('partner.calculate_commission', {
              policyId: payment.policyId,
              premium: payment.amount,
            })
            .pipe(timeout(5000)),
        );
      } catch {
        // Non-blocking — commission calc failure should not fail payment confirmation
      }
    }

    return payment;
  }

  async findPaymentsByPolicy(policyId: string) {
    return this.prisma.payment.findMany({
      where: { policyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPaymentsByUser(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

import { Injectable, NotFoundException, Inject, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { MSG } from '@kifcover/shared-types';

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('PRODUCTS_SERVICE') private readonly productsSvc: ClientProxy,
  ) {}

  async generate(productId: string, metadata: Record<string, any>, userId?: string): Promise<any> {
    // Fetch product from svc-products via TCP
    let product: any;
    try {
      product = await firstValueFrom(
        this.productsSvc.send(MSG.PRODUCT_FIND_ONE, { id: productId }).pipe(
          timeout(5000),
          catchError(() => throwError(() => new InternalServerErrorException('Products service unavailable'))),
        ),
      );
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to fetch product');
    }
    if (!product) throw new NotFoundException('Product not found');

    // Risk-adjusted premium engine
    let multiplier = 1.0;
    if (metadata.vehicleAge > 5)           multiplier += 0.15;
    if (metadata.age && metadata.age > 50) multiplier += 0.10;
    if (metadata.hasPreExistingCondition)  multiplier += 0.25;
    if (metadata.highRiskLocation)        multiplier += 0.20;
    if (metadata.travelDays > 14)         multiplier += 0.05;

    const premium   = Math.round(product.basePrice * multiplier * 100) / 100;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const quote = await this.prisma.quote.create({
      data: {
        productId,
        productName:   product.name,
        durationDays:  product.durationDays,
        userId,
        premium,
        coverageAmount: product.coverageAmount,
        metadata,
        expiresAt,
      },
    });

    // Return quote with embedded product snapshot for convenience
    return { ...quote, product };
  }

  async findById(id: string): Promise<any> {
    const q = await this.prisma.quote.findUnique({ where: { id } });
    if (!q) throw new NotFoundException('Quote not found');
    return q;
  }
}

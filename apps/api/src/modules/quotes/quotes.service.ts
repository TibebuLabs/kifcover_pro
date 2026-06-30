import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Dynamic quote engine — calculates premium based on product + metadata
   */
  async generateQuote(productId: string, metadata: Record<string, any>, userId?: string) {
    const product = await this.prisma.insuranceProduct.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    // Risk multiplier based on metadata (age, vehicle type, etc.)
    let multiplier = 1.0;
    if (metadata.vehicleAge > 5) multiplier += 0.15;
    if (metadata.age && metadata.age > 50) multiplier += 0.1;
    if (metadata.hasPreExistingCondition) multiplier += 0.25;

    const premium = Math.round(product.basePrice * multiplier * 100) / 100;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const quote = await this.prisma.quote.create({
      data: {
        productId,
        userId,
        premium,
        coverageAmount: product.coverageAmount,
        metadata,
        expiresAt,
      },
      include: { product: true },
    });

    return quote;
  }

  async findById(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(productId: string, metadata: Record<string, any>, userId?: string) {
    const product = await this.prisma.insuranceProduct.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    // Risk-based premium engine
    let multiplier = 1.0;
    if (metadata.vehicleAge > 5)              multiplier += 0.15;
    if (metadata.age && metadata.age > 50)    multiplier += 0.10;
    if (metadata.hasPreExistingCondition)      multiplier += 0.25;
    if (metadata.highRiskLocation)            multiplier += 0.20;
    if (metadata.travelDays > 14)             multiplier += 0.05;

    const premium      = Math.round(product.basePrice * multiplier * 100) / 100;
    const expiresAt    = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return this.prisma.quote.create({
      data: { productId, userId, premium, coverageAmount: product.coverageAmount, metadata, expiresAt },
      include: { product: true },
    });
  }

  async findById(id: string) {
    const q = await this.prisma.quote.findUnique({ where: { id }, include: { product: true } });
    if (!q) throw new NotFoundException('Quote not found');
    return q;
  }
}

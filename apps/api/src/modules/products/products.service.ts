import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string) {
    return this.prisma.insuranceProduct.findMany({
      where: {
        isActive: true,
        ...(category ? { category: category as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.insuranceProduct.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.insuranceProduct.create({
      data: {
        ...dto,
        features: JSON.stringify(dto.features),
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id); // ensures 404 if not found
    return this.prisma.insuranceProduct.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.features ? { features: JSON.stringify(dto.features) } : {}),
      },
    });
  }

  async seed() {
    const products = [
      { name: 'Auto Comprehensive', category: 'AUTO', basePrice: 1200, coverageAmount: 500000, durationDays: 365, description: 'Full vehicle protection against accidents, theft, and third-party liability.', features: ['Accident coverage', 'Theft protection', 'Third-party liability', 'Roadside assistance'] },
      { name: 'Health Basic', category: 'HEALTH', basePrice: 800, coverageAmount: 200000, durationDays: 365, description: 'Essential medical coverage for hospitalisation and outpatient care.', features: ['Hospitalisation', 'Outpatient visits', 'Emergency care', 'Prescription drugs'] },
      { name: 'Travel International', category: 'TRAVEL', basePrice: 350, coverageAmount: 1000000, durationDays: 30, description: 'Comprehensive travel protection for international trips.', features: ['Medical evacuation', 'Trip cancellation', 'Baggage loss', '24/7 assistance'] },
      { name: 'Gadget Shield', category: 'GADGET', basePrice: 200, coverageAmount: 50000, durationDays: 365, description: 'Protect your smartphone and electronics from damage and theft.', features: ['Accidental damage', 'Theft', 'Liquid damage', 'Screen protection'] },
    ];

    for (const p of products) {
      await this.prisma.insuranceProduct.upsert({
        where: { id: p.name },
        update: {},
        create: { ...p, features: JSON.stringify(p.features) } as any,
      });
    }
  }
}

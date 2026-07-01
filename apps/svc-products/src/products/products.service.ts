import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(category?: string) {
    return this.prisma.insuranceProduct.findMany({
      where: { isActive: true, ...(category ? { category: category as any } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const p = await this.prisma.insuranceProduct.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  create(data: any) {
    return this.prisma.insuranceProduct.create({
      data: { ...data, features: JSON.stringify(data.features ?? []) },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.insuranceProduct.update({
      where: { id },
      data: { ...data, ...(data.features ? { features: JSON.stringify(data.features) } : {}) },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(userId: string, type: string, fileUrl: string, ocrData?: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const doc = await this.prisma.kycDocument.create({
      data: { userId, type, fileUrl, ocrData, status: 'pending' },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'IN_PROGRESS' },
    });
    return doc;
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const documents = await this.prisma.kycDocument.findMany({ where: { userId } });
    return { kycStatus: user.kycStatus, documents };
  }

  async verify(userId: string, approved: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Mark all pending docs as verified/rejected
    await this.prisma.kycDocument.updateMany({
      where: { userId, status: 'pending' },
      data: { status: approved ? 'verified' : 'rejected' },
    });

    return this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: approved ? 'VERIFIED' : 'REJECTED' },
      select: { id: true, kycStatus: true, email: true },
    });
  }
}

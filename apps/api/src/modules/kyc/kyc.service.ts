import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadDocument(userId: string, type: string, fileUrl: string, ocrData?: any) {
    const doc = await this.prisma.kycDocument.create({
      data: { userId, type, fileUrl, ocrData, status: 'pending' },
    });
    // Trigger async verification (in production: call OCR/ID service)
    await this.prisma.user.update({ where: { id: userId }, data: { kycStatus: 'IN_PROGRESS' } });
    return doc;
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });
    const docs = await this.prisma.kycDocument.findMany({ where: { userId } });
    return { kycStatus: user?.kycStatus, documents: docs };
  }

  async verify(userId: string, approved: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: approved ? 'VERIFIED' : 'REJECTED' },
    });
  }
}

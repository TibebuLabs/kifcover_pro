import { Injectable, NotFoundException, Inject, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { MSG } from '@kifcover/shared-types';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('USERS_SERVICE') private readonly usersSvc: ClientProxy,
  ) {}

  async upload(userId: string, type: string, fileUrl: string, ocrData?: any): Promise<any> {
    // Ensure KYC record exists for this user
    let record = await this.prisma.kycRecord.findUnique({ where: { userId } });
    if (!record) {
      record = await this.prisma.kycRecord.create({ data: { userId, status: 'IN_PROGRESS' } });
    } else if (record.status === 'PENDING') {
      await this.prisma.kycRecord.update({ where: { userId }, data: { status: 'IN_PROGRESS' } });
    }

    const doc = await this.prisma.kycDocument.create({
      data: { userId, type: type as any, fileUrl, ocrData, status: 'PENDING' },
    });

    // Update kycStatus in svc-users via TCP (best effort)
    try {
      await firstValueFrom(
        this.usersSvc.send(MSG.USER_UPDATE, { id: userId, kycStatus: 'IN_PROGRESS' }).pipe(
          timeout(3000),
          catchError(() => throwError(() => new Error('users-svc-timeout'))),
        ),
      );
    } catch { /* non-blocking */ }

    return doc;
  }

  async getStatus(userId: string): Promise<any> {
    const record = await this.prisma.kycRecord.findUnique({ where: { userId } });
    const documents = await this.prisma.kycDocument.findMany({ where: { userId } });
    return {
      kycStatus: record?.status ?? 'PENDING',
      documents,
    };
  }

  async verify(userId: string, approved: boolean): Promise<any> {
    const record = await this.prisma.kycRecord.findUnique({ where: { userId } });
    if (!record) throw new NotFoundException('KYC record not found for this user');

    const newStatus = approved ? 'VERIFIED' : 'REJECTED';
    const docStatus = approved ? 'VERIFIED' : 'REJECTED';

    await this.prisma.kycDocument.updateMany({
      where: { userId, status: 'PENDING' },
      data: { status: docStatus as any },
    });

    await this.prisma.kycRecord.update({ where: { userId }, data: { status: newStatus as any } });

    // Update kycStatus in svc-users
    try {
      await firstValueFrom(
        this.usersSvc.send(MSG.USER_UPDATE, { id: userId, kycStatus: newStatus }).pipe(
          timeout(5000),
          catchError(() => throwError(() => new InternalServerErrorException('Users service unavailable'))),
        ),
      );
    } catch { /* log but don't fail */ }

    return { userId, kycStatus: newStatus };
  }
}

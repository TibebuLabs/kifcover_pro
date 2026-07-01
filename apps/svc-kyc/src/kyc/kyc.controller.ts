import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { KycService } from './kyc.service';

@Controller()
export class KycController {
  constructor(private readonly svc: KycService) {}

  @MessagePattern(MSG.KYC_UPLOAD)
  upload(@Payload() p: { userId: string; type: string; fileUrl: string; ocrData?: any }) {
    return this.svc.upload(p.userId, p.type, p.fileUrl, p.ocrData);
  }

  @MessagePattern(MSG.KYC_GET_STATUS)
  getStatus(@Payload() p: { userId: string }) {
    return this.svc.getStatus(p.userId);
  }

  @MessagePattern(MSG.KYC_VERIFY)
  verify(@Payload() p: { userId: string; approved: boolean }) {
    return this.svc.verify(p.userId, p.approved);
  }
}

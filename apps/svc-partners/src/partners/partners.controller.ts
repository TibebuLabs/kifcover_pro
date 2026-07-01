import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { PartnersService } from './partners.service';

@Controller()
export class PartnersController {
  constructor(private readonly svc: PartnersService) {}

  @MessagePattern(MSG.PARTNER_CREATE)
  create(@Payload() p: { name: string; slug: string; webhookUrl?: string; logoUrl?: string }) {
    return this.svc.create(p);
  }

  @MessagePattern(MSG.PARTNER_FIND_ALL)
  findAll() {
    return this.svc.findAll();
  }

  @MessagePattern(MSG.PARTNER_FIND_BY_ID)
  findById(@Payload() p: { id: string }) {
    return this.svc.findById(p.id);
  }

  @MessagePattern(MSG.PARTNER_GET_STATS)
  getStats(@Payload() p: { id: string }) {
    return this.svc.getStats(p.id);
  }

  @MessagePattern(MSG.PARTNER_REGEN_KEY)
  regenKey(@Payload() p: { id: string }) {
    return this.svc.regenerateApiKey(p.id);
  }
}

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { QuotesService } from './quotes.service';

@Controller()
export class QuotesController {
  constructor(private readonly svc: QuotesService) {}

  @MessagePattern(MSG.QUOTE_GENERATE)
  generate(@Payload() p: { productId: string; metadata: Record<string, any>; userId?: string }) {
    return this.svc.generate(p.productId, p.metadata, p.userId);
  }

  @MessagePattern(MSG.QUOTE_FIND_BY_ID)
  findById(@Payload() p: { id: string }) {
    return this.svc.findById(p.id);
  }
}

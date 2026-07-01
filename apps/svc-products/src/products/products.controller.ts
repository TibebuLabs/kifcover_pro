import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { ProductsService } from './products.service';

@Controller()
export class ProductsController {
  constructor(private readonly svc: ProductsService) {}

  @MessagePattern(MSG.PRODUCT_FIND_ALL)
  findAll(@Payload() p: { category?: string }) {
    return this.svc.findAll(p.category);
  }

  @MessagePattern(MSG.PRODUCT_FIND_ONE)
  findOne(@Payload() p: { id: string }) {
    return this.svc.findOne(p.id);
  }

  @MessagePattern(MSG.PRODUCT_CREATE)
  create(@Payload() p: any) {
    return this.svc.create(p);
  }

  @MessagePattern(MSG.PRODUCT_UPDATE)
  update(@Payload() p: { id: string; [key: string]: any }) {
    const { id, ...data } = p;
    return this.svc.update(id, data);
  }
}

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { InsurerService } from './insurer.service';

@Controller()
export class InsurerController {
  constructor(private readonly svc: InsurerService) {}

  @MessagePattern(MSG.PRODUCT_FIND_ALL)
  findAll(@Payload() p: { category?: string; insurerId?: string; includeInactive?: boolean }) {
    return this.svc.findAllProducts(p.category, p.insurerId, p.includeInactive);
  }

  @MessagePattern(MSG.PRODUCT_FIND_ONE)
  findOne(@Payload() p: { id: string }) {
    return this.svc.findOneProduct(p.id);
  }

  @MessagePattern(MSG.PRODUCT_CREATE)
  create(@Payload() p: any) {
    return this.svc.createProduct(p);
  }

  @MessagePattern(MSG.PRODUCT_UPDATE)
  update(@Payload() p: { id: string; [key: string]: any }) {
    const { id, ...data } = p;
    return this.svc.updateProduct(id, data);
  }

  @MessagePattern('insurer.product.publish')
  publish(@Payload() p: { id: string }) {
    return this.svc.publishProduct(p.id);
  }

  @MessagePattern('insurer.product.suspend')
  suspend(@Payload() p: { id: string }) {
    return this.svc.suspendProduct(p.id);
  }

  @MessagePattern(MSG.PRODUCT_ADD_RULE)
  addRule(@Payload() p: { productId: string; ruleKey: string; operator: string; value: string; multiplier: number }) {
    const { productId, ...rule } = p;
    return this.svc.addPricingRule(productId, rule);
  }

  @MessagePattern(MSG.PRODUCT_REMOVE_RULE)
  removeRule(@Payload() p: { ruleId: string }) {
    return this.svc.removePricingRule(p.ruleId);
  }

  @MessagePattern('insurer.product.add_tier')
  addTier(@Payload() p: { productId: string; [key: string]: any }) {
    const { productId, ...tier } = p;
    return this.svc.addPremiumTier(productId, tier);
  }

  @MessagePattern('insurer.product.remove_tier')
  removeTier(@Payload() p: { tierId: string }) {
    return this.svc.removePremiumTier(p.tierId);
  }

  @MessagePattern(MSG.PRODUCT_STATS)
  stats(@Payload() p: { insurerId?: string }) {
    return this.svc.getProductStats(p.insurerId);
  }

  @MessagePattern('insurer.calculate_premium')
  calculatePremium(@Payload() p: { productId: string; metadata: Record<string, any> }) {
    return this.svc.calculatePremium(p.productId, p.metadata);
  }
}

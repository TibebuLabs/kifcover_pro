import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InsurerService {
  constructor(private readonly prisma: PrismaService) {}

  private get db() { return this.prisma as any; }

  // ── Products ──────────────────────────────────────────────────────────────

  findAllProducts(category?: string, insurerId?: string, includeInactive = false) {
    return this.db.insuranceProduct.findMany({
      where: {
        ...(includeInactive ? {} : { status: 'PUBLISHED', isActive: true }),
        ...(category  ? { category: category as any } : {}),
        ...(insurerId ? { insurerId }                 : {}),
      },
      include: { pricingRules: true, premiumTiers: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneProduct(id: string) {
    const p = await this.db.insuranceProduct.findUnique({
      where: { id },
      include: { pricingRules: true, premiumTiers: true, underwritingRules: true },
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async createProduct(data: any) {
    const { pricingRules, premiumTiers, underwritingRules, features, exclusions, ...rest } = data;
    return this.db.insuranceProduct.create({
      data: {
        ...rest,
        features:   Array.isArray(features)   ? features   : [],
        exclusions: Array.isArray(exclusions) ? exclusions : [],
        ...(pricingRules?.length      ? { pricingRules:      { create: pricingRules      } } : {}),
        ...(premiumTiers?.length      ? { premiumTiers:      { create: premiumTiers      } } : {}),
        ...(underwritingRules?.length ? { underwritingRules: { create: underwritingRules } } : {}),
      },
      include: { pricingRules: true, premiumTiers: true },
    });
  }

  async updateProduct(id: string, data: any) {
    await this.findOneProduct(id);
    const { pricingRules, premiumTiers, underwritingRules, ...rest } = data;
    return this.db.insuranceProduct.update({
      where: { id },
      data: rest,
      include: { pricingRules: true, premiumTiers: true },
    });
  }

  async publishProduct(id: string) {
    await this.findOneProduct(id);
    return this.db.insuranceProduct.update({
      where: { id },
      data: { status: 'PUBLISHED', isActive: true },
    });
  }

  async suspendProduct(id: string) {
    await this.findOneProduct(id);
    return this.db.insuranceProduct.update({
      where: { id },
      data: { status: 'SUSPENDED', isActive: false },
    });
  }

  async addPricingRule(productId: string, rule: {
    ruleKey: string; operator: string; value: string; multiplier: number;
  }) {
    await this.findOneProduct(productId);
    return this.db.pricingRule.create({ data: { productId, ...rule } });
  }

  async removePricingRule(ruleId: string) {
    const rule = await this.db.pricingRule.findUnique({ where: { id: ruleId } });
    if (!rule) throw new NotFoundException('Pricing rule not found');
    return this.db.pricingRule.delete({ where: { id: ruleId } });
  }

  async addPremiumTier(productId: string, tier: any) {
    await this.findOneProduct(productId);
    return this.db.premiumTier.create({ data: { productId, ...tier } });
  }

  async removePremiumTier(tierId: string) {
    const tier = await this.db.premiumTier.findUnique({ where: { id: tierId } });
    if (!tier) throw new NotFoundException('Premium tier not found');
    return this.db.premiumTier.delete({ where: { id: tierId } });
  }

  // ── Insurer dashboard stats ───────────────────────────────────────────────

  async getProductStats(insurerId?: string) {
    const where = insurerId ? { insurerId } : {};
    const [total, active, byCategory, byStatus] = await Promise.all([
      this.db.insuranceProduct.count({ where }),
      this.db.insuranceProduct.count({ where: { ...where, isActive: true } }),
      this.db.insuranceProduct.groupBy({ by: ['category'], where, _count: { id: true } }),
      this.db.insuranceProduct.groupBy({ by: ['status'],   where, _count: { id: true } }),
    ]);
    return { total, active, byCategory, byStatus };
  }

  // ── Premium calculation engine ────────────────────────────────────────────

  async calculatePremium(productId: string, metadata: Record<string, any> = {}) {
    const product = await this.findOneProduct(productId);
    if (!product.isActive) throw new NotFoundException('Product is not available');

    let multiplier = 1.0;

    const appliedKeys = new Set<string>();

    for (const rule of product.pricingRules) {
      const metaVal = metadata[rule.ruleKey];
      if (metaVal === undefined) continue;

      let applies = false;
      const threshold = parseFloat(rule.value);

      switch (rule.operator) {
        case 'gt':   applies = Number(metaVal) > threshold;  break;
        case 'gte':  applies = Number(metaVal) >= threshold; break;
        case 'lt':   applies = Number(metaVal) < threshold;  break;
        case 'lte':  applies = Number(metaVal) <= threshold; break;
        case 'eq':   applies = String(metaVal) === rule.value; break;
        case 'ne':   applies = String(metaVal) !== rule.value; break;
        case 'bool': applies = Boolean(metaVal) === true;    break;
      }

      if (applies) {
        multiplier += rule.multiplier;
        appliedKeys.add(rule.ruleKey);
      }
    }

    // Hardcoded fallback rules — only apply if no DB rule covered that key
    const fallbacks: Array<{ key: string; condition: boolean; bump: number }> = [
      { key: 'vehicleAge',              condition: metadata.vehicleAge > 5,              bump: 0.15 },
      { key: 'age',                     condition: metadata.age > 50,                    bump: 0.10 },
      { key: 'hasPreExistingCondition', condition: Boolean(metadata.hasPreExistingCondition), bump: 0.25 },
      { key: 'highRiskLocation',        condition: Boolean(metadata.highRiskLocation),   bump: 0.20 },
      { key: 'travelDays',             condition: metadata.travelDays > 14,              bump: 0.05 },
    ];

    for (const fb of fallbacks) {
      if (!appliedKeys.has(fb.key) && fb.condition) {
        multiplier += fb.bump;
      }
    }

    // Match best premium tier if tiers exist
    let matchedTier: any = null;
    if (product.premiumTiers?.length) {
      const age = metadata.age;
      const sumInsured = metadata.coverageAmount || metadata.sumInsured;

      for (const tier of product.premiumTiers) {
        const ageMatch =
          (tier.minAge == null || (age != null && age >= tier.minAge)) &&
          (tier.maxAge == null || (age != null && age <= tier.maxAge));
        const sumMatch =
          (tier.sumInsuredMin == null || (sumInsured != null && sumInsured >= tier.sumInsuredMin)) &&
          (tier.sumInsuredMax == null || (sumInsured != null && sumInsured <= tier.sumInsuredMax));

        if (ageMatch && sumMatch) {
          matchedTier = tier;
          break;
        }
      }
    }

    const basePremium = matchedTier ? matchedTier.premium : product.basePrice;
    const premium = Math.round(basePremium * multiplier * 100) / 100;

    return {
      productId,
      productName:    product.name,
      basePrice:      product.basePrice,
      multiplier:     Math.round(multiplier * 100) / 100,
      premium,
      coverageAmount: product.coverageAmount,
      durationDays:   product.durationDays,
      ...(matchedTier ? { matchedTier: matchedTier.label } : {}),
      product,
    };
  }
}

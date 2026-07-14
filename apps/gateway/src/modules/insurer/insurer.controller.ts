import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  Inject, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { IsString, IsNumber, IsIn, IsOptional, IsPositive, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';

class CreateProductDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descriptionAm?: string;
  @ApiProperty({ enum: ['AUTO','HEALTH','TRAVEL','GADGET','LIFE','AGRICULTURE','SME'] })
  @IsIn(['AUTO','HEALTH','TRAVEL','GADGET','LIFE','AGRICULTURE','SME']) category: string;
  @ApiProperty() @IsNumber() @IsPositive() @Type(() => Number) basePrice: number;
  @ApiProperty() @IsNumber() @IsPositive() @Type(() => Number) coverageAmount: number;
  @ApiProperty() @IsNumber() @IsPositive() @Type(() => Number) durationDays: number;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() features?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() exclusions?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() termsUrl?: string;
}

class AddPricingRuleDto {
  @ApiProperty() @IsString() ruleKey: string;
  @ApiProperty({ enum: ['gt','lt','eq','bool'] }) @IsIn(['gt','lt','eq','bool']) operator: string;
  @ApiProperty() @IsString() value: string;
  @ApiProperty() @IsNumber() @Type(() => Number) multiplier: number;
}

class AddPremiumTierDto {
  @ApiProperty() @IsString() label: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() minAge?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxAge?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() sumInsuredMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() sumInsuredMax?: number;
  @ApiProperty() @IsNumber() @IsPositive() premium: number;
}

@ApiTags('🏦 Insurer')
@ApiBearerAuth()
@Controller('insurer')
export class InsurerController {
  constructor(@Inject('INSURER_SERVICE') private readonly svc: ClientProxy) {}

  // ── Products ──────────────────────────────────────────────────────────────
  @Public()
  @Get('products')
  @ApiOperation({ summary: 'List active insurance products (public)' })
  @ApiQuery({ name: 'category', required: false })
  findAll(@Query('category') category?: string, @Query('insurerId') insurerId?: string) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_FIND_ALL, { category, insurerId }));
  }

  @Public()
  @Get('products/:id')
  @ApiOperation({ summary: 'Get product details (public)' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_FIND_ONE, { id }));
  }

  @Roles('PLATFORM_ADMIN','INSURANCE_PROVIDER')
  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create insurance product — insurer/admin only' })
  create(@Body() dto: CreateProductDto, @Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_CREATE, { ...dto, insurerId: req.user.id }));
  }

  @Roles('PLATFORM_ADMIN','INSURANCE_PROVIDER')
  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product details' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_UPDATE, { id, ...dto }));
  }

  @Roles('PLATFORM_ADMIN','INSURANCE_PROVIDER')
  @Post('products/:id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish product to marketplace' })
  publish(@Param('id') id: string) {
    return firstValueFrom(this.svc.send('insurer.product.publish', { id }));
  }

  @Roles('PLATFORM_ADMIN','INSURANCE_PROVIDER')
  @Post('products/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend product from marketplace' })
  suspend(@Param('id') id: string) {
    return firstValueFrom(this.svc.send('insurer.product.suspend', { id }));
  }

  // ── Pricing rules ─────────────────────────────────────────────────────────
  @Roles('PLATFORM_ADMIN','INSURANCE_PROVIDER')
  @Post('products/:id/pricing-rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add risk-adjustment pricing rule' })
  addRule(@Param('id') productId: string, @Body() dto: AddPricingRuleDto) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_ADD_RULE, { productId, ...dto }));
  }

  @Roles('PLATFORM_ADMIN','INSURANCE_PROVIDER')
  @Delete('pricing-rules/:ruleId')
  @ApiOperation({ summary: 'Remove a pricing rule' })
  removeRule(@Param('ruleId') ruleId: string) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_REMOVE_RULE, { ruleId }));
  }

  // ── Premium tiers ─────────────────────────────────────────────────────────
  @Roles('PLATFORM_ADMIN','INSURANCE_PROVIDER')
  @Post('products/:id/premium-tiers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a premium tier to a product' })
  addTier(@Param('id') productId: string, @Body() dto: AddPremiumTierDto) {
    return firstValueFrom(this.svc.send('insurer.product.add_tier', { productId, ...dto }));
  }

  @Roles('PLATFORM_ADMIN','INSURANCE_PROVIDER')
  @Delete('premium-tiers/:tierId')
  @ApiOperation({ summary: 'Remove a premium tier' })
  removeTier(@Param('tierId') tierId: string) {
    return firstValueFrom(this.svc.send('insurer.product.remove_tier', { tierId }));
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  @Roles('PLATFORM_ADMIN','INSURANCE_PROVIDER')
  @Get('stats')
  @ApiOperation({ summary: 'Insurer product stats & dashboard KPIs' })
  stats(@Request() req: any, @Query('insurerId') insurerId?: string) {
    const id = req.user.role === 'INSURANCE_PROVIDER' ? req.user.id : insurerId;
    return firstValueFrom(this.svc.send(MSG.PRODUCT_STATS, { insurerId: id }));
  }

  // ── Premium calculation ───────────────────────────────────────────────────
  @Public()
  @Post('products/:id/calculate-premium')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate risk-adjusted premium for a product' })
  calculatePremium(@Param('id') productId: string, @Body() body: { metadata: Record<string, any> }) {
    return firstValueFrom(this.svc.send('insurer.calculate_premium', { productId, metadata: body.metadata }));
  }
}

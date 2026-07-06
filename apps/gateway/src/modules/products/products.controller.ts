import { Controller, Get, Post, Patch, Param, Body, Query, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiParam, ApiQuery, ApiBody,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { CreateProductDto } from '../../dto';

@ApiTags('📦 Products')
@Controller('products')
export class ProductsController {
  constructor(@Inject('PRODUCTS_SERVICE') private readonly svc: ClientProxy) {}

  // ── List products (public) ────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all active insurance products', description: 'No auth required. Optionally filter by category.' })
  @ApiQuery({ name: 'category', required: false, enum: ['AUTO', 'HEALTH', 'TRAVEL', 'GADGET', 'LIFE', 'AGRICULTURE'] })
  @ApiResponse({ status: 200, description: 'Array of InsuranceProduct objects' })
  findAll(@Query('category') category?: string) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_FIND_ALL, { category }));
  }

  // ── Get one product (public) ──────────────────────────────────────────────

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Insurance product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_FIND_ONE, { id }));
  }

  // ── Create product (admin) ────────────────────────────────────────────────

  @ApiBearerAuth()
  @Roles('PLATFORM_ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new insurance product — admin only' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 403, description: 'Requires PLATFORM_ADMIN role' })
  create(@Body() body: CreateProductDto) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_CREATE, body));
  }

  // ── Update product (admin) ────────────────────────────────────────────────

  @ApiBearerAuth()
  @Roles('PLATFORM_ADMIN')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an insurance product — admin only' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id') id: string, @Body() body: Partial<CreateProductDto>) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_UPDATE, { id, ...body }));
  }
}

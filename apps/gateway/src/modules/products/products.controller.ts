import { Controller, Get, Post, Patch, Param, Body, Query, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { JwtGatewayGuard } from '../../guards/jwt-gateway.guard';

@ApiTags('Products')
@UseGuards(JwtGatewayGuard)
@Controller('products')
export class ProductsController {
  constructor(@Inject('PRODUCTS_SERVICE') private readonly svc: ClientProxy) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all active products' })
  @ApiQuery({ name: 'category', required: false })
  findAll(@Query('category') category?: string) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_FIND_ALL, { category }));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get product details' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_FIND_ONE, { id }));
  }

  @ApiBearerAuth()
  @Roles('PLATFORM_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create product (admin)' })
  create(@Body() body: any) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_CREATE, body));
  }

  @ApiBearerAuth()
  @Roles('PLATFORM_ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update product (admin)' })
  update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.svc.send(MSG.PRODUCT_UPDATE, { id, ...body }));
  }
}

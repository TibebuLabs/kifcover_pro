import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PartnersService } from './partners.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePartnerDto } from './dto/partner.dto';

@ApiTags('Partners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PLATFORM_ADMIN')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new partner (admin only)' })
  create(@Body() dto: CreatePartnerDto) {
    return this.partnersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all partners (admin only)' })
  findAll() {
    return this.partnersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get partner by ID' })
  findOne(@Param('id') id: string) {
    return this.partnersService.findById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get partner analytics summary' })
  stats(@Param('id') id: string) {
    return this.partnersService.getStats(id);
  }

  @Post(':id/regenerate-key')
  @ApiOperation({ summary: 'Regenerate partner API key' })
  regenerateKey(@Param('id') id: string) {
    return this.partnersService.regenerateApiKey(id);
  }
}

import { Controller, Post, Get, Param, Body, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiParam, ApiBody,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';
import { CreatePartnerDto } from '../../dto';

@ApiTags('🤝 Partners')
@ApiBearerAuth()
@Roles('PLATFORM_ADMIN')
@Controller('partners')
export class PartnersController {
  constructor(@Inject('PARTNERS_SERVICE') private readonly svc: ClientProxy) {}

  // ── Register partner ──────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new API partner — admin only',
    description: 'Creates a partner account with auto-generated API key.',
  })
  @ApiBody({ type: CreatePartnerDto })
  @ApiResponse({ status: 201, description: 'Partner created with apiKey' })
  @ApiResponse({ status: 409, description: 'Slug already taken' })
  create(@Body() dto: CreatePartnerDto) {
    return firstValueFrom(this.svc.send(MSG.PARTNER_CREATE, dto));
  }

  // ── List partners ─────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all registered partners — admin only' })
  @ApiResponse({ status: 200, description: 'Array of Partner objects' })
  findAll() {
    return firstValueFrom(this.svc.send(MSG.PARTNER_FIND_ALL, {}));
  }

  // ── Get partner ───────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get partner by ID — admin only' })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, description: 'Partner object' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.PARTNER_FIND_BY_ID, { id }));
  }

  // ── Partner analytics ─────────────────────────────────────────────────────

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get partner analytics — admin only', description: 'Returns totalPolicies, totalRevenue, activePolicies.' })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, description: '{ totalPolicies, totalRevenue, activePolicies }' })
  stats(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.PARTNER_GET_STATS, { id }));
  }

  // ── Regenerate API key ────────────────────────────────────────────────────

  @Post(':id/regenerate-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Regenerate partner API key — admin only', description: 'Invalidates existing key and issues a new one.' })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, description: 'Partner with new apiKey' })
  regenKey(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.PARTNER_REGEN_KEY, { id }));
  }
}

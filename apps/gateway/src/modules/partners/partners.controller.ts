import { Controller, Post, Get, Param, Body, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';
import { JwtGatewayGuard } from '../../guards/jwt-gateway.guard';

@ApiTags('Partners')
@ApiBearerAuth()
@UseGuards(JwtGatewayGuard)
@Roles('PLATFORM_ADMIN')
@Controller('partners')
export class PartnersController {
  constructor(@Inject('PARTNERS_SERVICE') private readonly svc: ClientProxy) {}

  @Post()
  @ApiOperation({ summary: 'Register a partner (admin)' })
  create(@Body() body: any) {
    return firstValueFrom(this.svc.send(MSG.PARTNER_CREATE, body));
  }

  @Get()
  @ApiOperation({ summary: 'List all partners (admin)' })
  findAll() {
    return firstValueFrom(this.svc.send(MSG.PARTNER_FIND_ALL, {}));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get partner by ID' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.PARTNER_FIND_BY_ID, { id }));
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get partner stats' })
  stats(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.PARTNER_GET_STATS, { id }));
  }

  @Post(':id/regenerate-key')
  @ApiOperation({ summary: 'Regenerate API key' })
  regenKey(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.PARTNER_REGEN_KEY, { id }));
  }
}

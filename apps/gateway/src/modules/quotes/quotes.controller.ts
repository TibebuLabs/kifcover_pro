import { Controller, Post, Get, Param, Body, Inject, UseGuards, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Public } from '../../decorators/public.decorator';
import { JwtGatewayGuard } from '../../guards/jwt-gateway.guard';

@ApiTags('Quotes')
@UseGuards(JwtGatewayGuard)
@Controller('quotes')
export class QuotesController {
  constructor(@Inject('QUOTES_SERVICE') private readonly svc: ClientProxy) {}

  @Public()
  @Post('generate')
  @ApiOperation({ summary: 'Generate an insurance quote' })
  generate(@Body() body: { productId: string; metadata: Record<string, unknown> }, @Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.QUOTE_GENERATE, { ...body, userId: req.user?.id }));
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get quote by ID' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.QUOTE_FIND_BY_ID, { id }));
  }
}

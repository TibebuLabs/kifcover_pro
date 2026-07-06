import { Controller, Post, Get, Param, Body, Inject, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiParam, ApiBody,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Public } from '../../decorators/public.decorator';
import { GenerateQuoteDto } from '../../dto';

@ApiTags('💬 Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(@Inject('QUOTES_SERVICE') private readonly svc: ClientProxy) {}

  // ── Generate quote (public — userId attached if authenticated) ────────────

  @Public()
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate a personalised insurance quote',
    description: 'Calculates a risk-adjusted premium. Pass metadata like age, vehicleAge, hasPreExistingCondition.',
  })
  @ApiBody({ type: GenerateQuoteDto })
  @ApiResponse({ status: 201, description: 'Quote generated — { id, premium, coverageAmount, expiresAt, product }' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  generate(@Body() dto: GenerateQuoteDto, @Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.QUOTE_GENERATE, { ...dto, userId: req.user?.id }));
  }

  // ── Get quote by ID ───────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get quote by ID' })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  @ApiResponse({ status: 200, description: 'Quote details with embedded product' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.QUOTE_FIND_BY_ID, { id }));
  }
}

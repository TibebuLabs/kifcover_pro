import { Controller, Post, Get, Param, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateQuoteDto } from './dto/quote.dto';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a dynamic insurance quote' })
  generate(@Body() dto: GenerateQuoteDto, @Request() req: any) {
    return this.quotesService.generateQuote(dto.productId, dto.metadata as Record<string, any>, req?.user?.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get quote by ID' })
  findOne(@Param('id') id: string) {
    return this.quotesService.findById(id);
  }
}

import { Controller, Post, Get, Patch, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClaimsService } from './claims.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SubmitClaimDto, ReviewClaimDto } from './dto/submit-claim.dto';

@ApiTags('Claims')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new claim' })
  submit(@Request() req: any, @Body() dto: SubmitClaimDto) {
    return this.claimsService.submit(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my claims' })
  myClaims(@Request() req: any) {
    return this.claimsService.findByUser(req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('PLATFORM_ADMIN', 'INSURANCE_PROVIDER')
  @ApiOperation({ summary: 'List all claims (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.claimsService.findAll(+page, +limit, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get claim details' })
  findOne(@Param('id') id: string, @Request() req: any) {
    // Admin can see all, customers only their own (handled inside service)
    const isAdmin = ['PLATFORM_ADMIN', 'INSURANCE_PROVIDER'].includes(req.user.role);
    return this.claimsService.findById(id, isAdmin ? undefined : req.user.id);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles('PLATFORM_ADMIN', 'INSURANCE_PROVIDER')
  @ApiOperation({ summary: 'Review a claim (admin)' })
  review(@Param('id') id: string, @Body() dto: ReviewClaimDto) {
    return this.claimsService.review(id, dto);
  }
}

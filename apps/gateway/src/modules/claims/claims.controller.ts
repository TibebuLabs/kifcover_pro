import { Controller, Post, Get, Patch, Param, Body, Query, Inject, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiParam, ApiQuery, ApiBody,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';
import { SubmitClaimDto, ReviewClaimDto } from '../../dto';

@ApiTags('🩺 Claims')
@ApiBearerAuth()
@Controller('claims')
export class ClaimsController {
  constructor(@Inject('CLAIMS_SERVICE') private readonly svc: ClientProxy) {}

  // ── Submit claim ──────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a new insurance claim',
    description: 'Validates policy ownership, active status, incident date, and coverage limit.',
  })
  @ApiBody({ type: SubmitClaimDto })
  @ApiResponse({ status: 201, description: 'Claim submitted successfully' })
  @ApiResponse({ status: 400, description: 'Policy not active, incident in future, or amount exceeds coverage' })
  submit(@Request() req: any, @Body() dto: SubmitClaimDto) {
    return firstValueFrom(this.svc.send(MSG.CLAIM_SUBMIT, { userId: req.user.id, ...dto }));
  }

  // ── My claims ─────────────────────────────────────────────────────────────

  @Get('my')
  @ApiOperation({ summary: "Get the current user's claims" })
  @ApiResponse({ status: 200, description: 'Array of Claim objects' })
  myClaims(@Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.CLAIM_FIND_BY_USER, { userId: req.user.id }));
  }

  // ── List all claims (admin) ───────────────────────────────────────────────

  @Roles('PLATFORM_ADMIN', 'INSURANCE_PROVIDER')
  @Get()
  @ApiOperation({ summary: 'List all claims — admin/insurer only' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'] })
  @ApiResponse({ status: 200, description: '{ data: Claim[], total, page, limit }' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return firstValueFrom(this.svc.send(MSG.CLAIM_FIND_ALL, { page: +page, limit: +limit, status }));
  }

  // ── Get claim by ID ───────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get claim by ID', description: 'Customers can only view their own claims.' })
  @ApiParam({ name: 'id', description: 'Claim UUID' })
  @ApiResponse({ status: 200, description: 'Claim details' })
  @ApiResponse({ status: 403, description: 'Not your claim' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  findOne(@Param('id') id: string, @Request() req: any) {
    const isAdmin = ['PLATFORM_ADMIN', 'INSURANCE_PROVIDER'].includes(req.user.role);
    return firstValueFrom(this.svc.send(MSG.CLAIM_FIND_BY_ID, { id, requestingUserId: isAdmin ? undefined : req.user.id }));
  }

  // ── Review claim (admin) ──────────────────────────────────────────────────

  @Roles('PLATFORM_ADMIN', 'INSURANCE_PROVIDER')
  @Patch(':id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Review a claim — admin/insurer only',
    description: 'FSM transitions: SUBMITTED→UNDER_REVIEW→{APPROVED,REJECTED}→PAID',
  })
  @ApiParam({ name: 'id', description: 'Claim UUID' })
  @ApiBody({ type: ReviewClaimDto })
  @ApiResponse({ status: 200, description: 'Claim status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  review(@Param('id') id: string, @Body() dto: ReviewClaimDto) {
    return firstValueFrom(this.svc.send(MSG.CLAIM_REVIEW, { id, ...dto }));
  }
}

import { Controller, Post, Get, Patch, Param, Body, Query, Inject, UseGuards, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';
import { JwtGatewayGuard } from '../../guards/jwt-gateway.guard';

@ApiTags('Claims')
@ApiBearerAuth()
@UseGuards(JwtGatewayGuard)
@Controller('claims')
export class ClaimsController {
  constructor(@Inject('CLAIMS_SERVICE') private readonly svc: ClientProxy) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new claim' })
  submit(@Request() req: any, @Body() body: any) {
    return firstValueFrom(this.svc.send(MSG.CLAIM_SUBMIT, { userId: req.user.id, ...body }));
  }

  @Get('my')
  @ApiOperation({ summary: "Get current user's claims" })
  myClaims(@Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.CLAIM_FIND_BY_USER, { userId: req.user.id }));
  }

  @Roles('PLATFORM_ADMIN', 'INSURANCE_PROVIDER')
  @Get()
  @ApiOperation({ summary: 'List all claims (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return firstValueFrom(this.svc.send(MSG.CLAIM_FIND_ALL, { page: +page, limit: +limit, status }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get claim by ID' })
  findOne(@Param('id') id: string, @Request() req: any) {
    const isAdmin = ['PLATFORM_ADMIN', 'INSURANCE_PROVIDER'].includes(req.user.role);
    return firstValueFrom(this.svc.send(MSG.CLAIM_FIND_BY_ID, { id, requestingUserId: isAdmin ? undefined : req.user.id }));
  }

  @Roles('PLATFORM_ADMIN', 'INSURANCE_PROVIDER')
  @Patch(':id/review')
  @ApiOperation({ summary: 'Review a claim (admin)' })
  review(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.svc.send(MSG.CLAIM_REVIEW, { id, ...body }));
  }
}

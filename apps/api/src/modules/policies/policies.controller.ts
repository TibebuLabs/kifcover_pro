import { Controller, Post, Get, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IssuePolicyDto } from './dto/issue-policy.dto';

@ApiTags('Policies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Post('issue')
  @ApiOperation({ summary: 'Issue a policy from a quote' })
  issue(@Request() req: any, @Body() dto: IssuePolicyDto) {
    return this.policiesService.issuePolicy(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my policies' })
  myPolicies(@Request() req: any) {
    return this.policiesService.findByUser(req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('PLATFORM_ADMIN', 'INSURANCE_PROVIDER', 'PARTNER_ADMIN')
  @ApiOperation({ summary: 'List all policies (admin/partner)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'partnerId', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
    @Query('partnerId') partnerId?: string,
  ) {
    return this.policiesService.findAll(+page, +limit, status, partnerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy by ID' })
  findOne(@Param('id') id: string) {
    return this.policiesService.findById(id);
  }
}

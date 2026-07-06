import { Controller, Get, Patch, Param, Body, Query, Inject, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiParam, ApiQuery, ApiBody,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';
import { UpdateProfileDto } from '../../dto';

@ApiTags('👤 Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(@Inject('USERS_SERVICE') private readonly svc: ClientProxy) {}

  // ── List all users (admin) ────────────────────────────────────────────────

  @Roles('PLATFORM_ADMIN')
  @Get()
  @ApiOperation({ summary: 'List all users — admin only', description: 'Paginated list of all registered users.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: '{ data: UserProfile[], total, page, limit }' })
  @ApiResponse({ status: 403, description: 'Requires PLATFORM_ADMIN role' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return firstValueFrom(this.svc.send(MSG.USER_FIND_ALL, { page: +page, limit: +limit }));
  }

  // ── Get own profile ───────────────────────────────────────────────────────

  @Get('me')
  @ApiOperation({ summary: 'Get own full profile' })
  @ApiResponse({ status: 200, description: 'Returns the authenticated user profile' })
  getMe(@Request() req: any) {
    return firstValueFrom(this.svc.send(MSG.USER_FIND_BY_ID, { id: req.user.id }));
  }

  // ── Update own profile ────────────────────────────────────────────────────

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update own profile (firstName, lastName, phone)' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Updated user profile' })
  updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return firstValueFrom(this.svc.send(MSG.USER_UPDATE, { id: req.user.id, ...dto }));
  }

  // ── Get user by ID ────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID', example: 'a4f0e3b2-...' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.USER_FIND_BY_ID, { id }));
  }

  // ── Admin update user ─────────────────────────────────────────────────────

  @Roles('PLATFORM_ADMIN')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update any user — admin only' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Updated user' })
  @ApiResponse({ status: 403, description: 'Requires PLATFORM_ADMIN role' })
  update(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return firstValueFrom(this.svc.send(MSG.USER_UPDATE, { id, ...dto }));
  }
}

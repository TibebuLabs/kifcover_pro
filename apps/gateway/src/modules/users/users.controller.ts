import { Controller, Get, Patch, Param, Body, Query, Inject, UseGuards, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MSG } from '@kifcover/shared-types';
import { Roles } from '../../decorators/roles.decorator';
import { JwtGatewayGuard } from '../../guards/jwt-gateway.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtGatewayGuard)
@Controller('users')
export class UsersController {
  constructor(@Inject('USERS_SERVICE') private readonly svc: ClientProxy) {}

  @Roles('PLATFORM_ADMIN')
  @Get()
  @ApiOperation({ summary: 'List all users (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return firstValueFrom(this.svc.send(MSG.USER_FIND_ALL, { page: +page, limit: +limit }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.svc.send(MSG.USER_FIND_BY_ID, { id }));
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update own profile' })
  updateMe(@Request() req: any, @Body() body: any) {
    return firstValueFrom(this.svc.send(MSG.USER_UPDATE, { id: req.user.id, ...body }));
  }

  @Roles('PLATFORM_ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update any user (admin)' })
  update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.svc.send(MSG.USER_UPDATE, { id, ...body }));
  }
}

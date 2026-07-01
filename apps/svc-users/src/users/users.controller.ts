import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MSG } from '@kifcover/shared-types';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @MessagePattern(MSG.USER_FIND_ALL)
  findAll(@Payload() p: { page: number; limit: number }) {
    return this.svc.findAll(p.page, p.limit);
  }

  @MessagePattern(MSG.USER_FIND_BY_ID)
  findById(@Payload() p: { id: string }) {
    return this.svc.findById(p.id);
  }

  @MessagePattern(MSG.USER_FIND_BY_EMAIL)
  findByEmail(@Payload() p: { email: string }) {
    return this.svc.findByEmail(p.email);
  }

  @MessagePattern(MSG.USER_CREATE)
  create(@Payload() p: any) {
    return this.svc.create(p);
  }

  @MessagePattern(MSG.USER_UPDATE)
  update(@Payload() p: { id: string; firstName?: string; lastName?: string; phone?: string }) {
    const { id, ...data } = p;
    return this.svc.update(id, data);
  }
}

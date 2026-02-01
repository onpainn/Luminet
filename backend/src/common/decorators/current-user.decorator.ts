import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { User } from '../../modules/users/user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.user) {
      throw new Error('CurrentUser decorator used without JwtAuthGuard');
    }

    return request.user as User;
  },
);

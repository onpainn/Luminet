/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { RefreshSessionsService } from './refresh-sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth/sessions')
@UseGuards(JwtAuthGuard)
export class RefreshSessionsController {
  constructor(
    private readonly refreshSessionsService: RefreshSessionsService,
  ) {}

  @Get()
  getMySessions(@CurrentUser() user: { id: number }): any {
    return this.refreshSessionsService.findByUser(user.id);
  }

  @Delete(':id')
  deleteSession(
    @CurrentUser() user: { id: number },
    @Param('id') sessionId: string,
  ) {
    return this.refreshSessionsService.remove(user.id, sessionId);
  }
}

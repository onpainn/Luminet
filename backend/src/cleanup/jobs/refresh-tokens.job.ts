import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CleanupService } from '../cleanup.service';

@Injectable()
export class RefreshTokensJob {
  constructor(private readonly cleanupService: CleanupService) {}

  // каждый день в 03:00 ночи
  @Cron('0 3 * * *')
  async handleCleanup() {
    await this.cleanupService.cleanupRefreshSessions();
  }
}

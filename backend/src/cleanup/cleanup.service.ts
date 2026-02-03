import { Injectable, Logger } from '@nestjs/common';
import { RefreshSessionsService } from '../modules/refresh-sessions/refresh-sessions.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly refreshSessionsService: RefreshSessionsService,
  ) {}

  // =========================
  // REFRESH SESSIONS CLEANUP
  // =========================
  async cleanupRefreshSessions(): Promise<void> {
    try {
      const deletedCount =
        await this.refreshSessionsService.deleteExpiredSessions();

      if (deletedCount > 0) {
        this.logger.log(
          `Refresh sessions cleanup: removed ${deletedCount} expired sessions`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Refresh sessions cleanup failed',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}

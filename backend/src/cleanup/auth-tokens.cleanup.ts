import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuthTokensService } from '../modules/auth-tokens/auth-tokens.service';

@Injectable()
export class AuthTokensCleanup {
  private readonly logger = new Logger(AuthTokensCleanup.name);

  constructor(private readonly authTokensService: AuthTokensService) {}

  // каждый день в 03:00
  @Cron('0 3 * * *')
  async cleanupExpiredAuthTokens() {
    const removed = await this.authTokensService.removeExpired();

    if (removed > 0) {
      this.logger.log(`Removed ${removed} expired auth tokens`);
    }
  }
}

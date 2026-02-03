import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { RefreshSessionsModule } from '../modules/refresh-sessions/refresh-sessions.module';
import { RefreshTokensJob } from './jobs/refresh-tokens.job';
import { AuthTokensCleanup } from './auth-tokens.cleanup';
import { AuthTokensModule } from 'src/modules/auth-tokens/auth-tokens.module';

@Module({
  imports: [RefreshSessionsModule, AuthTokensModule],
  providers: [CleanupService, RefreshTokensJob, AuthTokensCleanup],
})
export class CleanupModule {}

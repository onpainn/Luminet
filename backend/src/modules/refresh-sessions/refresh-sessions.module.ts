import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshSession } from './refresh-session.entity';
import { RefreshSessionsService } from './refresh-sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshSession])],
  providers: [RefreshSessionsService],
  exports: [RefreshSessionsService],
})
export class RefreshSessionsModule {}

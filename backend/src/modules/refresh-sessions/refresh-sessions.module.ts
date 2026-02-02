import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshSession } from './refresh-session.entity';
import { RefreshSessionsService } from './refresh-sessions.service';
import { RefreshSessionsController } from './refresh-sessions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshSession])],
  providers: [RefreshSessionsService],
  controllers: [RefreshSessionsController],
  exports: [RefreshSessionsService],
})
export class RefreshSessionsModule {}

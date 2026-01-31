import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic])],
  exports: [TypeOrmModule],
})
export class TopicsModule {}

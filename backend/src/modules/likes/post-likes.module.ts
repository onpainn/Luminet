import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLike } from './post-like.entity';
import { PostLikesService } from './post-likes.service';
import { PostLikesController } from './post-likes.controller';
import { Post } from '../posts/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostLike, Post])],
  providers: [PostLikesService],
  controllers: [PostLikesController],
})
export class PostLikesModule {}

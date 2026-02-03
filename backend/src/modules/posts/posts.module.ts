import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TagsModule } from '../tags/tags.module';
import { Mood } from '../moods/mood.entity';
import { Topic } from '../topics/topic.entity';
import { Tag } from '../tags/tag.entity';
import { PostLike } from '../likes/post-like.entity';
import { Comment } from '../comments/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Mood, Topic, Tag, PostLike, Comment]),
    TagsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}

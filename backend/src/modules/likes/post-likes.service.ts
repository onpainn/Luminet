import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLike } from './post-like.entity';
import { Post } from '../posts/post.entity';
import { User } from '../users/user.entity';

@Injectable()
export class PostLikesService {
  constructor(
    @InjectRepository(PostLike)
    private readonly likesRepository: Repository<PostLike>,

    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async like(postId: number, user: User) {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existing = await this.likesRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: user.id },
      },
    });

    if (existing) {
      throw new ConflictException('Post already liked');
    }

    const like = this.likesRepository.create({
      post,
      user,
    });

    await this.likesRepository.save(like);

    return { liked: true };
  }

  async unlike(postId: number, user: User) {
    const result = await this.likesRepository.delete({
      post: { id: postId },
      user: { id: user.id },
    });

    if (!result.affected) {
      throw new NotFoundException('Like not found');
    }

    return { liked: false };
  }

  async count(postId: number): Promise<number> {
    return this.likesRepository.count({
      where: { post: { id: postId } },
    });
  }
}

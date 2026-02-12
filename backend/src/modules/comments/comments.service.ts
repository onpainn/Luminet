import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { Post } from '../posts/post.entity';
import { User } from '../users/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { toCommentPublicDto } from './comment.mapper';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async create(postId: number, dto: CreateCommentDto, user: User) {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentsRepository.create({
      content: dto.content,
      author: user,
      post,
    });

    const saved = await this.commentsRepository.save(comment);

    return toCommentPublicDto(saved);
  }

  async findByPost(postId: number, limit = 20, offset = 0) {
    const [comments, total] = await this.commentsRepository.findAndCount({
      where: { post: { id: postId } },
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });

    return {
      total,
      items: comments.map(toCommentPublicDto),
    };
  }
  async deleteComment(commentId: number, userId: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['author', 'post', 'post.author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isAuthor = comment.author.id === userId;
    const isPostOwner = comment.post.author.id === userId;

    if (!isAuthor && !isPostOwner) {
      throw new ForbiddenException('You cannot delete this comment');
    }

    await this.commentsRepository.remove(comment);
  }
}

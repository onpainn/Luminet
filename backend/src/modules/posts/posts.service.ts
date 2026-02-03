import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../users/user.entity';
import { Mood } from '../moods/mood.entity';
import { Topic } from '../topics/topic.entity';
import { Tag } from '../tags/tag.entity';
import { toPostPublicDto } from './post.mapper';
import { PostPublicDto } from './dto/post-public.dto';
import { PostLike } from '../likes/post-like.entity';
import { Comment } from '../comments/comment.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    @InjectRepository(Mood)
    private readonly moodsRepository: Repository<Mood>,

    @InjectRepository(Topic)
    private readonly topicsRepository: Repository<Topic>,

    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,

    @InjectRepository(PostLike)
    private readonly postLikesRepository: Repository<PostLike>,

    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  // ---------------- CREATE POST ----------------
  async create(dto: CreatePostDto, user: User): Promise<PostPublicDto> {
    const mood = await this.moodsRepository.findOne({
      where: { id: dto.moodId },
    });
    if (!mood) throw new NotFoundException('Mood not found');

    const topic = await this.topicsRepository.findOne({
      where: { id: dto.topicId },
    });
    if (!topic) throw new NotFoundException('Topic not found');

    let tags: Tag[] = [];

    if (dto.tags?.length) {
      const existingTags = await this.tagsRepository.find({
        where: { name: In(dto.tags) },
      });

      const existingNames = existingTags.map((t) => t.name);

      const newTags = dto.tags
        .filter((name) => !existingNames.includes(name))
        .map((name) => this.tagsRepository.create({ name }));

      const savedNewTags = await this.tagsRepository.save(newTags);
      tags = [...existingTags, ...savedNewTags];
    }

    const post = this.postsRepository.create({
      content: dto.content,
      author: user,
      mood,
      topic,
      tags,
    });

    const savedPost = await this.postsRepository.save(post);

    return toPostPublicDto(
      savedPost,
      0, // likesCount
      false, // likedByMe
      0, // commentsCount
    );
  }

  // ---------------- FEED ----------------
  async findFeed(
    user: User,
    limit = 20,
    offset = 0,
  ): Promise<{ total: number; items: PostPublicDto[] }> {
    const [posts, total] = await this.postsRepository.findAndCount({
      relations: {
        author: true,
        mood: true,
        topic: true,
        tags: true,
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    if (posts.length === 0) {
      return { total: 0, items: [] };
    }

    const postIds = posts.map((p) => p.id);

    // ---- likes count ----
    const likesCountRaw = await this.postLikesRepository
      .createQueryBuilder('like')
      .select('like.postId', 'postId')
      .addSelect('COUNT(*)', 'count')
      .where('like.postId IN (:...postIds)', { postIds })
      .groupBy('like.postId')
      .getRawMany();

    const likesCountMap = new Map<number, number>();
    likesCountRaw.forEach((row) =>
      likesCountMap.set(Number(row.postId), Number(row.count)),
    );

    // ---- liked by me ----
    const myLikesRaw = await this.postLikesRepository
      .createQueryBuilder('like')
      .select('like.postId', 'postId')
      .where('like.userId = :userId', { userId: user.id })
      .andWhere('like.postId IN (:...postIds)', { postIds })
      .getRawMany();

    const likedPostIds = new Set<number>(
      myLikesRaw.map((row) => Number(row.postId)),
    );

    // ---- comments count ----
    const commentsCountRaw = await this.commentsRepository
      .createQueryBuilder('comment')
      .select('comment.postId', 'postId')
      .addSelect('COUNT(*)', 'count')
      .where('comment.postId IN (:...postIds)', { postIds })
      .groupBy('comment.postId')
      .getRawMany();

    const commentsCountMap = new Map<number, number>();
    commentsCountRaw.forEach((row) =>
      commentsCountMap.set(Number(row.postId), Number(row.count)),
    );

    return {
      total,
      items: posts.map((post) =>
        toPostPublicDto(
          post,
          likesCountMap.get(post.id) ?? 0,
          likedPostIds.has(post.id),
          commentsCountMap.get(post.id) ?? 0,
        ),
      ),
    };
  }
}

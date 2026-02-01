import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../users/user.entity';
import { Mood } from '../moods/mood.entity';
import { Topic } from '../topics/topic.entity';
import { Tag } from '../tags/tag.entity';

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
  ) {}

  async create(dto: CreatePostDto, user: User): Promise<Post> {
    const mood = await this.moodsRepository.findOne({
      where: { id: dto.moodId },
    });

    if (!mood) {
      throw new NotFoundException('Mood not found');
    }

    const topic = await this.topicsRepository.findOne({
      where: { id: dto.topicId },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    let tags: Tag[] = [];

    if (dto.tags?.length) {
      const existingTags = await this.tagsRepository.find({
        where: { name: In(dto.tags) },
      });

      const existingNames = existingTags.map((tag) => tag.name);

      const newTags = dto.tags
        .filter((name) => !existingNames.includes(name))
        .map((name) =>
          this.tagsRepository.create({
            name,
          }),
        );

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

    return this.postsRepository.save(post);
  }
}

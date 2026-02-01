import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async findOrCreate(tagNames: string[]): Promise<Tag[]> {
    if (!tagNames.length) return [];

    const normalized = tagNames.map((t) => t.toLowerCase().trim());

    const existingTags = await this.tagsRepository.find({
      where: { name: In(normalized) },
    });

    const existingNames = existingTags.map((t) => t.name);

    const newTags = normalized
      .filter((name) => !existingNames.includes(name))
      .map((name) => this.tagsRepository.create({ name }));

    if (newTags.length) {
      await this.tagsRepository.save(newTags);
    }

    return [...existingTags, ...newTags];
  }
}

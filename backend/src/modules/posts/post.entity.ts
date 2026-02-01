import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Tag } from '../tags/tag.entity';
import { Topic } from '../topics/topic.entity';
import { Mood } from '../moods/mood.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE',
  })
  author: User;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Topic, { eager: true, nullable: false })
  topic: Topic;

  @ManyToOne(() => Mood, { eager: true, nullable: false })
  mood: Mood;

  @ManyToMany(() => Tag, { eager: true })
  @JoinTable()
  tags: Tag[];
}

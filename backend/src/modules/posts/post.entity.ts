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
import { PostMood } from './enums/post-mood.enum';
import { Tag } from '../tags/tag.entity';
import { Topic } from '../topics/topic.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.posts, {
    onDelete: 'CASCADE',
  })
  author: User;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Topic, { eager: true })
  topic: Topic;

  @Column({ type: 'enum', enum: PostMood })
  mood: PostMood;

  @ManyToMany(() => Tag, { eager: true })
  @JoinTable()
  tags: Tag[];
}

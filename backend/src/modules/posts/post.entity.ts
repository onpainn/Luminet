import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Mood } from '../moods/mood.entity';
import { Topic } from '../topics/topic.entity';
import { Tag } from '../tags/tag.entity';
import { PostLike } from '../likes/post-like.entity';
import { Comment } from '../comments/comment.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  author: User;

  @ManyToOne(() => Mood, { eager: true })
  mood: Mood;

  @ManyToOne(() => Topic, { eager: true })
  topic: Topic;

  @ManyToMany(() => Tag, { eager: true })
  @JoinTable({
    name: 'post_tags',
  })
  tags: Tag[];

  @OneToMany(() => PostLike, (like) => like.post)
  likes: PostLike[];

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}

import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  DeleteDateColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../posts/post.entity';
import { RefreshSession } from '../refresh-sessions/refresh-session.entity';
import { Comment } from '../comments/comment.entity';

@Entity('users')
@Index(['email'])
@Index(['username'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => RefreshSession, (session) => session.user)
  refreshSessions: RefreshSession[];

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];
}

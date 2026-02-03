import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { AuthTokenType } from './auth-token.types';

@Entity('auth_tokens')
@Index(['tokenHash'])
@Index(['expiresAt'])
export class AuthToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tokenHash: string;

  @Column({
    type: 'enum',
    enum: AuthTokenType,
  })
  type: AuthTokenType;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

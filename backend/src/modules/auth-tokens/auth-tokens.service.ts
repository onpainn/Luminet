import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AuthToken } from './auth-token.entity';
import { AuthTokenType } from './auth-token.types';
import { User } from '../users/user.entity';
import { MoreThan } from 'typeorm';

@Injectable()
export class AuthTokensService {
  constructor(
    @InjectRepository(AuthToken)
    private readonly repo: Repository<AuthToken>,
  ) {}

  // CREATE
  async create(data: {
    user: User;
    tokenHash: string;
    type: AuthTokenType;
    expiresAt: Date;
  }): Promise<AuthToken> {
    const token = this.repo.create(data);
    return this.repo.save(token);
  }

  // FIND VALID TOKEN
  async findValidToken(tokenHash: string, type: AuthTokenType) {
    return this.repo.findOne({
      where: {
        tokenHash,
        type,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });
  }

  // REMOVE ONE
  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // CLEANUP EXPIRED
  async removeExpired(): Promise<number> {
    const result = await this.repo.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected ?? 0;
  }
}

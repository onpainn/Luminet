import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { RefreshSession } from './refresh-session.entity';
import { User } from '../users/user.entity';

@Injectable()
export class RefreshSessionsService {
  constructor(
    @InjectRepository(RefreshSession)
    private readonly repo: Repository<RefreshSession>,
  ) {}

  // =========================
  // CREATE
  // =========================
  async create(params: {
    user: User;
    refreshTokenHash: string;
    userAgent: string;
    ip: string;
    expiresAt: Date;
  }): Promise<RefreshSession> {
    const session = this.repo.create({
      user: params.user,
      refreshTokenHash: params.refreshTokenHash,
      userAgent: params.userAgent,
      ip: params.ip,
      expiresAt: params.expiresAt,
    });

    return this.repo.save(session);
  }

  // =========================
  // READ
  // =========================
  async findById(id: string): Promise<RefreshSession | null> {
    return this.repo.findOne({
      where: {
        id,
        revokedAt: IsNull(),
      },
      relations: ['user'],
    });
  }

  async findActiveByUser(userId: number): Promise<RefreshSession[]> {
    return this.repo.find({
      where: {
        user: { id: userId },
        revokedAt: IsNull(),
      },
      relations: ['user'],
    });
  }

  // =========================
  // REVOKE
  // =========================
  async revoke(session: RefreshSession | string): Promise<void> {
    const id = typeof session === 'string' ? session : session.id;

    await this.repo.update(id, {
      revokedAt: new Date(),
    });
  }

  async revokeAll(userId: number): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(RefreshSession)
      .set({ revokedAt: new Date() })
      .where('userId = :userId', { userId })
      .execute();
  }
}

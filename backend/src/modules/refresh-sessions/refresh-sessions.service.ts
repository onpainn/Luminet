import { Injectable, NotFoundException } from '@nestjs/common';
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
  async create(data: {
    user: User;
    refreshTokenHash: string;
    ip: string;
    userAgent: string;
    expiresAt: Date;
  }): Promise<RefreshSession> {
    const session = this.repo.create({
      ...data,
      revokedAt: null,
    });

    return this.repo.save(session);
  }

  // =========================
  // FIND BY ID
  // =========================
  async findById(id: string): Promise<RefreshSession | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  // =========================
  // FIND ALL BY USER
  // =========================
  async findByUser(userId: number): Promise<RefreshSession[]> {
    return this.repo.find({
      where: {
        user: { id: userId },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // =========================
  // UPDATE HASH
  // =========================
  async updateHash(id: string, refreshTokenHash: string): Promise<void> {
    await this.repo.update(id, {
      refreshTokenHash,
    });
  }

  // =========================
  // REVOKE ONE
  // =========================
  async revoke(id: string): Promise<void> {
    await this.repo.update(id, {
      revokedAt: new Date(),
    });
  }

  // =========================
  // REMOVE ONE (by owner)
  // =========================
  async remove(userId: number, sessionId: string): Promise<void> {
    const session = await this.repo.findOne({
      where: {
        id: sessionId,
        user: { id: userId },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.repo.remove(session);
  }

  // =========================
  // REVOKE ALL FOR USER
  // =========================
  async revokeAll(userId: number): Promise<void> {
    await this.repo.update(
      {
        user: { id: userId },
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );
  }
}

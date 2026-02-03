import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { RefreshSession } from './refresh-session.entity';
import { User } from '../users/user.entity';
import { LessThan } from 'typeorm';
import { RefreshSessionDto } from './dto/refresh-session.dto';

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
  async findByUser(
    userId: number,
    currentSessionId?: string,
  ): Promise<RefreshSessionDto[]> {
    const sessions = await this.repo.find({
      where: {
        user: { id: userId },
        revokedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      ip: session.ip ?? 'unknown',
      userAgent: session.userAgent ?? 'unknown',
      createdAt: session.createdAt,
      revokedAt: session.revokedAt,
      isCurrent: session.id === currentSessionId,
    }));
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
  async revokeByOwner(userId: number, sessionId: string): Promise<void> {
    const result = await this.repo.update(
      {
        id: sessionId,
        user: { id: userId },
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );

    if (!result.affected) {
      throw new NotFoundException('Session not found');
    }
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
  // =========================
  // CLEANUP EXPIRED SESSIONS
  // =========================
  async deleteExpiredSessions(): Promise<number> {
    const result = await this.repo.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected ?? 0;
  }
  async revokeAllExcept(
    userId: number,
    currentSessionId: string,
  ): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ revokedAt: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('id != :currentSessionId', { currentSessionId })
      .andWhere('revokedAt IS NULL')
      .execute();
  }
}

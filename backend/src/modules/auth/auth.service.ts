import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { UsersService } from '../users/users.service';
import { RefreshSessionsService } from '../refresh-sessions/refresh-sessions.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user.entity';
import { AuthResponse, AuthUser } from './types/auth-user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshSessionsService: RefreshSessionsService,
    private readonly configService: ConfigService,
  ) {}

  // =========================
  // LOGIN
  // =========================
  async login(
    email: string,
    password: string,
    req: Request,
  ): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user, req);
  }

  // =========================
  // REGISTER
  // =========================
  async register(dto: RegisterDto, req: Request): Promise<AuthResponse> {
    const user = await this.usersService.create(dto);
    return this.issueTokens(user, req);
  }

  // =========================
  // REFRESH (КЛЮЧЕВОЕ МЕСТО)
  // =========================
  async refresh(
    user: { userId: number; sessionId: string },
    req: Request,
  ): Promise<AuthResponse> {
    const { userId, sessionId } = user;

    const session = await this.refreshSessionsService.findById(sessionId);

    if (
      !session ||
      session.revokedAt ||
      session.user.id !== userId ||
      session.expiresAt < new Date()
    ) {
      throw new UnauthorizedException();
    }

    // 🔁 ротация
    await this.refreshSessionsService.revoke(sessionId);

    return this.issueTokens(session.user, req);
  }

  // =========================
  // LOGOUT
  // =========================
  async logout(refreshToken: string) {
    let payload: { sub: number };

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException();
    }

    await this.refreshSessionsService.revokeAll(payload.sub);
    return { success: true };
  }

  // =========================
  // HELPERS
  // =========================
  private async issueTokens(user: User, req: Request): Promise<AuthResponse> {
    // 1️⃣ access token
    const accessToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '15m' },
    );

    // 2️⃣ create refresh session
    const session = await this.refreshSessionsService.create({
      user,
      refreshTokenHash: 'temp',
      ip: req.ip ?? 'unknown',
      userAgent: req.headers['user-agent'] ?? 'unknown',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // 3️⃣ refresh token с sid
    const refreshToken = this.jwtService.sign(
      { sub: user.id, sid: session.id },
      {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    // 4️⃣ hash refresh token
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.refreshSessionsService.updateHash(session.id, refreshTokenHash);

    return {
      user: this.toAuthUser(user),
      accessToken,
      refreshToken,
    };
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }
}

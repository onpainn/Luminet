import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user.entity';
import { RefreshSessionsService } from '../refresh-sessions/refresh-sessions.service';
import { Request } from 'express';
import { randomUUID } from 'crypto';

interface RefreshPayload {
  sub: number;
  sid: string;
}

interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshSessionsService: RefreshSessionsService,
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
  // REFRESH (ROTATION + REUSE DETECTION)
  // =========================
  async refresh(refreshToken: string, req: Request): Promise<AuthResponse> {
    let payload: RefreshPayload;

    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException();
    }

    const session = await this.refreshSessionsService.findById(payload.sid);

    if (!session || session.user.id !== payload.sub) {
      await this.refreshSessionsService.revokeAll(payload.sub);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const isValid = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isValid) {
      await this.refreshSessionsService.revokeAll(payload.sub);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    // rotation
    await this.refreshSessionsService.revoke(session.id);

    return this.issueTokens(session.user, req);
  }

  // =========================
  // LOGOUT (ALL SESSIONS)
  // =========================
  async logout(refreshToken: string) {
    let payload: { sub: number };

    try {
      payload = this.jwtService.verify(refreshToken);
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
    const accessToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '15m' },
    );

    const sessionId = randomUUID();

    const refreshToken = this.jwtService.sign(
      { sub: user.id, sid: sessionId },
      { expiresIn: '7d' },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.refreshSessionsService.create({
      user,
      refreshTokenHash,
      ip: req.ip ?? 'unknown',
      userAgent: req.headers['user-agent'] ?? 'unknown',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }
}

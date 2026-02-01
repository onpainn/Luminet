import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // LOGIN
  // =========================
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  // =========================
  // REGISTER
  // =========================
  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    return this.issueTokens(user);
  }

  // =========================
  // REFRESH
  // =========================
  async refresh(refreshToken: string) {
    let payload: { sub: number };

    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  // =========================
  // LOGOUT
  // =========================
  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);
    return { success: true };
  }

  // =========================
  // HELPERS
  // =========================
  private async issueTokens(user: User) {
    const payload = { sub: user.id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, refreshTokenHash);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: User) {
    const { password, refreshTokenHash, ...rest } = user;
    return rest;
  }
}

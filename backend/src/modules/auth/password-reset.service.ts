import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { UsersService } from '../users/users.service';
import { AuthTokensService } from '../auth-tokens/auth-tokens.service';
import { AuthTokenType } from '../auth-tokens/auth-token.types';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authTokensService: AuthTokensService,
  ) {}

  // =========================
  // REQUEST RESET
  // =========================
  async request(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // 🔒 не палим, существует ли email
      return;
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hash(token);

    await this.authTokensService.create({
      user,
      tokenHash,
      type: AuthTokenType.PASSWORD_RESET,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 минут
    });

    // TODO: отправка email
    console.log('PASSWORD RESET TOKEN:', token);
  }

  // =========================
  // CONFIRM RESET
  // =========================
  async confirm(token: string, newPassword: string): Promise<void> {
    const tokenHash = this.hash(token);

    const authToken = await this.authTokensService.findValidToken(
      tokenHash,
      AuthTokenType.PASSWORD_RESET,
    );

    if (!authToken) {
      throw new NotFoundException('Invalid or expired token');
    }

    await this.usersService.updatePassword(authToken.user.id, newPassword);

    await this.authTokensService.remove(authToken.id);
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { AuthTokensService } from '../auth-tokens/auth-tokens.service';
import { AuthTokenType } from '../auth-tokens/auth-token.types';
import { UsersService } from '../users/users.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly authTokensService: AuthTokensService,
    private readonly usersService: UsersService,
  ) {}

  // =========================
  // SEND VERIFICATION
  // =========================
  async send(userId: number): Promise<void> {
    const user = await this.usersService.findById(userId);

    if (user.emailVerifiedAt) {
      return;
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hash(token);

    await this.authTokensService.create({
      user,
      tokenHash,
      type: AuthTokenType.EMAIL_VERIFY,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 часа
    });

    // TODO: email
    console.log('EMAIL VERIFY TOKEN:', token);
  }

  // =========================
  // VERIFY
  // =========================
  async verify(token: string): Promise<void> {
    const tokenHash = this.hash(token);

    const authToken = await this.authTokensService.findValidToken(
      tokenHash,
      AuthTokenType.EMAIL_VERIFY,
    );

    if (!authToken) {
      throw new NotFoundException('Invalid or expired token');
    }

    await this.usersService.markEmailVerified(authToken.user.id);
    await this.authTokensService.remove(authToken.id);
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}

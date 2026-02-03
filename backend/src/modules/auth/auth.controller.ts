import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  REFRESH_COOKIE,
  REFRESH_COOKIE_OPTIONS,
} from 'src/common/constants/auth-cookies';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { PasswordResetService } from './password-reset.service';
import { EmailVerificationService } from './email-verification.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Throttle } from '@nestjs/throttler';
import { EmailThrottlerGuard } from 'src/common/guards/email-throttler.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  // =========================
  // LOGIN
  // =========================

  @Post('login')
  @UseGuards(EmailThrottlerGuard)
  @Throttle({
    auth: {},
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...data } = await this.authService.login(
      dto.email,
      dto.password,
      req,
    );

    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
    return data;
  }

  // =========================
  // REGISTER
  // =========================
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...data } = await this.authService.register(dto, req);

    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
    return data;
  }
  // =========================
  // REFRESH
  // =========================
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @Req()
    req: Request & {
      user: { userId: number; sessionId: string };
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    const { refreshToken: newRefreshToken, ...data } =
      await this.authService.refresh(req.user, refreshToken, req);

    res.cookie(REFRESH_COOKIE, newRefreshToken, REFRESH_COOKIE_OPTIONS);
    return data;
  }
  // =========================
  // LOGOUT
  // =========================
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTIONS);
    return { success: true };
  }
  // =========================
  // PASSWORD RESET
  // =========================
  @UseGuards(EmailThrottlerGuard)
  @Post('password-reset')
  @Throttle({
    passwordReset: {},
  })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    await this.passwordResetService.request(dto.email);
    return { ok: true };
  }

  @Post('password-reset/confirm')
  async confirmPasswordReset(@Body() dto: ConfirmPasswordResetDto) {
    await this.passwordResetService.confirm(dto.token, dto.password);
    return { ok: true };
  }
  // =========================
  // EMAIL VERIFICATION
  // =========================
  @UseGuards(JwtAuthGuard)
  @Post('email/resend')
  async resendVerification(@CurrentUser() user: User) {
    await this.emailVerificationService.send(user.id);
    return { ok: true };
  }

  @Post('email/verify')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.emailVerificationService.verify(dto.token);
    return { ok: true };
  }
}

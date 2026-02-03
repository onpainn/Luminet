import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { RefreshSessionsModule } from '../refresh-sessions/refresh-sessions.module';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { AuthTokensModule } from '../auth-tokens/auth-tokens.module';
import { PasswordResetService } from './password-reset.service';
import { EmailVerificationService } from './email-verification.service';

@Module({
  imports: [
    UsersModule,
    AuthTokensModule,
    PassportModule,
    RefreshSessionsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    PasswordResetService,
    EmailVerificationService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}

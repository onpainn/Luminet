import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

import { RefreshSessionsService } from '../../refresh-sessions/refresh-sessions.service';
import { REFRESH_COOKIE } from 'src/common/constants/auth-cookies';

interface RefreshPayload {
  sub: number;
  sid: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly refreshSessionsService: RefreshSessionsService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return req.cookies?.[REFRESH_COOKIE] ?? null;
      },
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: RefreshPayload) {
    const session = await this.refreshSessionsService.findById(payload.sid);

    if (!session || session.user.id !== payload.sub) {
      throw new UnauthorizedException();
    }

    return {
      userId: payload.sub,
      sessionId: payload.sid,
    };
  }
}

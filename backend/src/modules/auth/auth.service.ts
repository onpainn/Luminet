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
  ) { }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);

    return this.buildAuthResponse(user);
  }

  // =========================
  // Helpers
  // =========================

  private buildAuthResponse(user: User) {
    const payload = { sub: user.id };

    return {
      user: this.sanitizeUser(user),
      accessToken: this.jwtService.sign(payload),
    };
  }

  private sanitizeUser(user: User) {
    const { password: _password, ...rest } = user;
    return rest;
  }
}

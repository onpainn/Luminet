import {
  Controller,
  Get,
  Body,
  UseGuards,
  Patch,
  Post,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteProfileDto } from './dto/delete-profile.dto';
import { toUserPublicDto } from './user.mapper';
import type { AuthUser } from '../auth/types/auth-user.type';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =========================
  // CURRENT USER
  // =========================
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: AuthUser) {
    const fullUser = await this.usersService.findById(user.id);
    return toUserPublicDto(fullUser);
  }

  // =========================
  // UPDATE PROFILE
  // =========================
  @Patch('me')
  async updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
    const updated = await this.usersService.updateMe(user.id, dto);
    return toUserPublicDto(updated);
  }

  // =========================
  // CHANGE PASSWORD
  // =========================
  @Patch('me/password')
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(user.id, dto);
    return { success: true };
  }

  // =========================
  // DELETE / DEACTIVATE PROFILE
  // =========================
  @Post('me/delete')
  async deleteProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: DeleteProfileDto,
  ) {
    await this.usersService.deleteProfile(user.id, dto.password);
    return { success: true };
  }

  @Get(':username')
  getPublicProfile(@Param('username') username: string) {
    return this.usersService
      .findPublicByUsername(username)
      .then(toUserPublicDto);
  }
}

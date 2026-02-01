import { Controller, Get, Body, UseGuards, Patch, Post } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteProfileDto } from './dto/delete-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =========================
  // CURRENT USER
  // =========================
  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.usersService.safeUser(user);
  }

  // =========================
  // UPDATE PROFILE
  // =========================
  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(user.id, dto);
  }

  // =========================
  // CHANGE PASSWORD
  // =========================
  @Patch('me/password')
  changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto);
  }

  // =========================
  // DELETE / DEACTIVATE PROFILE
  // =========================
  @Post('me/delete')
  deleteProfile(@CurrentUser() user: User, @Body() dto: DeleteProfileDto) {
    return this.usersService.deleteProfile(user.id, dto.password);
  }
}

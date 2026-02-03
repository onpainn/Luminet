import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { PostLikesService } from './post-likes.service';

@UseGuards(JwtAuthGuard)
@Controller('posts/:postId/likes')
export class PostLikesController {
  constructor(private readonly likesService: PostLikesService) {}

  @Post()
  async like(@Param('postId') postId: number, @CurrentUser() user: User) {
    return this.likesService.like(+postId, user);
  }

  @Delete()
  async unlike(@Param('postId') postId: number, @CurrentUser() user: User) {
    return this.likesService.unlike(+postId, user);
  }

  @Get('count')
  async count(@Param('postId') postId: number) {
    return {
      count: await this.likesService.count(+postId),
    };
  }
}

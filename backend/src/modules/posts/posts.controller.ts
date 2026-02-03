import {
  Controller,
  Post as HttpPost,
  Body,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../users/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @HttpPost()
  async create(@Body() dto: CreatePostDto, @CurrentUser() user: User) {
    return this.postsService.create(dto, user);
  }

  @Get()
  async feed(
    @CurrentUser() user: User,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.postsService.findFeed(user, +limit, +offset);
  }
}

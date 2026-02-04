import {
  Controller,
  Post as HttpPost,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../users/user.entity';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  create(
    @Param('postId') postId: number,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.create(+postId, dto, user);
  }

  @Get()
  findAll(
    @Param('postId') postId: number,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.commentsService.findByPost(+postId, +limit, +offset);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.commentsService.delete(id, user.id);
    return { deleted: true };
  }
}

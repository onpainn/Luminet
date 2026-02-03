import { Comment } from './comment.entity';
import { CommentPublicDto } from './dto/comment-public.dto';

export function toCommentPublicDto(comment: Comment): CommentPublicDto {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: {
      id: comment.author.id,
      username: comment.author.username,
    },
  };
}

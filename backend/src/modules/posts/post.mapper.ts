import { Post } from './post.entity';
import { PostPublicDto } from './dto/post-public.dto';

export function toPostPublicDto(
  post: Post,
  likesCount: number,
  likedByMe: boolean,
  commentsCount: number,
): PostPublicDto {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      username: post.author.username,
    },
    mood: {
      id: post.mood.id,
      name: post.mood.label,
    },
    topic: {
      id: post.topic.id,
      name: post.topic.label,
    },
    tags: post.tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    })),
    likesCount,
    likedByMe,
    commentsCount,
  };
}

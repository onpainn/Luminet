export class PostPublicDto {
  id: number;
  content: string;
  createdAt: Date;

  author: {
    id: number;
    username: string;
  };

  mood: {
    id: number;
    name: string;
  };

  topic: {
    id: number;
    name: string;
  };

  tags: {
    id: number;
    name: string;
  }[];

  likesCount: number;
  likedByMe: boolean;

  commentsCount: number;
}

export class CommentPublicDto {
  id: number;
  content: string;
  createdAt: Date;

  author: {
    id: number;
    username: string;
  };
}

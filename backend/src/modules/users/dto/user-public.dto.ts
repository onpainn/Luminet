import { Expose } from 'class-transformer';

export class UserPublicDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  createdAt: Date;
}

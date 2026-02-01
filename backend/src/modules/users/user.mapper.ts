import { User } from './user.entity';
import { UserPublicDto } from './dto/user-public.dto';

type UserLike = Pick<User, 'id' | 'email' | 'username' | 'createdAt'>;

export function toUserPublicDto(user: UserLike): UserPublicDto {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
  };
}

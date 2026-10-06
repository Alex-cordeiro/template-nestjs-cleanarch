import { User } from '../../../domain/entities';
import { UserResponseDto } from '../../dto/users/user.dto';

export function toUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    last_name: user.last_name,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

import { User } from '../../entities';
import { Paginated, PaginationParams } from '../../pagination/pagination';

export interface IUserRepository {
  create(data: {
    name: string;
    last_name: string;
    username: string;
    email: string;
    password_hash: string;
  }): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAllPaginated(params: PaginationParams): Promise<Paginated<User>>;
  update(
    id: string,
    data: Partial<{
      name: string;
      last_name: string;
      username: string;
      email: string;
      password_hash: string;
    }>,
  ): Promise<User>;
  delete(id: string): Promise<void>;
}

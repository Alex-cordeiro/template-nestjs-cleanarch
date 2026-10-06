import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities';
import { IUserRepository } from '../../../domain/repositories/users/user.repository';
import {
  Paginated,
  PaginationParams,
} from '../../../domain/pagination/pagination';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    last_name: string;
    username: string;
    email: string;
    password_hash: string;
  }): Promise<User> {
    const created = await this.prisma.user.create({ data });
    return new User(created);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? new User(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user ? new User(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? new User(user) : null;
  }

  async findAllPaginated({
    limit,
    offset,
    search,
  }: PaginationParams): Promise<Paginated<User>> {
    const term = search?.trim();
    const where = term
      ? {
          OR: [
            { name: { contains: term, mode: 'insensitive' as const } },
            { last_name: { contains: term, mode: 'insensitive' as const } },
            { username: { contains: term, mode: 'insensitive' as const } },
            { email: { contains: term, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items: users.map((u) => new User(u)), total };
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      last_name: string;
      username: string;
      email: string;
      password_hash: string;
    }>,
  ): Promise<User> {
    const updated = await this.prisma.user.update({ where: { id }, data });
    return new User(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}

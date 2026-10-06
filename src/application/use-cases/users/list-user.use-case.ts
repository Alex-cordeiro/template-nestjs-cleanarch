import { Inject, Injectable } from '@nestjs/common';
import { IUserRepositoryToken } from '../../../infrastructure/database/database.module';
import type { IUserRepository } from '../../../domain/repositories/users/user.repository';
import { DEFAULT_PAGE_SIZE } from '../../../domain/pagination/pagination';
import {
  ListUsersQueryDto,
  ListUsersResponseDto,
} from '../../dto/users/user.dto';
import { toUserResponse } from './user-response.mapper';

@Injectable()
export class ListUserUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: ListUsersQueryDto): Promise<ListUsersResponseDto> {
    const { items, total } = await this.userRepository.findAllPaginated({
      limit: query.limit ?? DEFAULT_PAGE_SIZE,
      offset: query.offset ?? 0,
      search: query.search,
    });

    return { items: items.map(toUserResponse), total };
  }
}

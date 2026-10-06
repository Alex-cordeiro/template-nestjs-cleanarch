import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepositoryToken } from '../../../infrastructure/database/database.module';
import type { IUserRepository } from '../../../domain/repositories/users/user.repository';
import { UserResponseDto } from '../../dto/users/user.dto';
import { toUserResponse } from './user-response.mapper';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return toUserResponse(user);
  }
}

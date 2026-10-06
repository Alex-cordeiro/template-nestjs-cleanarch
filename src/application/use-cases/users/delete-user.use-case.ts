import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepositoryToken } from '../../../infrastructure/database/database.module';
import type { IUserRepository } from '../../../domain/repositories/users/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    await this.userRepository.delete(id);
  }
}

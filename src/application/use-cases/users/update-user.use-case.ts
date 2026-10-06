import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HashService } from '../../../infrastructure/auth/hash.service';
import { IUserRepositoryToken } from '../../../infrastructure/database/database.module';
import type { IUserRepository } from '../../../domain/repositories/users/user.repository';
import { UpdateUserDto, UserResponseDto } from '../../dto/users/user.dto';
import { toUserResponse } from './user-response.mapper';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (dto.username !== undefined && dto.username !== user.username) {
      if (await this.userRepository.findByUsername(dto.username)) {
        throw new ConflictException('Nome de usuário já existe');
      }
    }
    if (dto.email !== undefined && dto.email !== user.email) {
      if (await this.userRepository.findByEmail(dto.email)) {
        throw new ConflictException('E-mail já cadastrado');
      }
    }

    const updateData: Parameters<IUserRepository['update']>[1] = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.last_name !== undefined) updateData.last_name = dto.last_name;
    if (dto.username !== undefined) updateData.username = dto.username;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.password) {
      updateData.password_hash = await this.hashService.hash(dto.password);
    }

    const updated = await this.userRepository.update(id, updateData);
    return toUserResponse(updated);
  }
}

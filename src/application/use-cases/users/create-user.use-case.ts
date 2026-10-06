import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { HashService } from '../../../infrastructure/auth/hash.service';
import { IUserRepositoryToken } from '../../../infrastructure/database/database.module';
import type { IUserRepository } from '../../../domain/repositories/users/user.repository';
import { CreateUserDto, UserResponseDto } from '../../dto/users/user.dto';
import { toUserResponse } from './user-response.mapper';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    if (await this.userRepository.findByUsername(dto.username)) {
      throw new ConflictException('Nome de usuário já existe');
    }
    if (await this.userRepository.findByEmail(dto.email)) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const password_hash = await this.hashService.hash(dto.password);
    const user = await this.userRepository.create({
      name: dto.name,
      last_name: dto.last_name,
      username: dto.username,
      email: dto.email,
      password_hash,
    });

    return toUserResponse(user);
  }
}

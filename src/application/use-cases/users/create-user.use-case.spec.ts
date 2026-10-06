import { ConflictException } from '@nestjs/common';
import { User } from '../../../domain/entities';
import type { IUserRepository } from '../../../domain/repositories/users/user.repository';
import { HashService } from '../../../infrastructure/auth/hash.service';
import { CreateUserUseCase } from './create-user.use-case';

describe('CreateUserUseCase', () => {
  const dto = {
    name: 'Maria',
    last_name: 'Silva',
    username: 'maria.silva',
    email: 'maria@exemplo.com',
    password: 'senha123',
  };

  let repository: jest.Mocked<IUserRepository>;
  let createMock: jest.Mock;
  let hashService: jest.Mocked<Pick<HashService, 'hash'>>;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    createMock = jest.fn();
    repository = {
      create: createMock,
      findById: jest.fn(),
      findByUsername: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findAllPaginated: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    hashService = { hash: jest.fn().mockResolvedValue('hashed') };
    useCase = new CreateUserUseCase(repository, hashService as HashService);
  });

  it('cria o usuário com a senha hasheada e não expõe o hash', async () => {
    createMock.mockResolvedValue(
      new User({
        id: 'id-1',
        name: dto.name,
        last_name: dto.last_name,
        username: dto.username,
        email: dto.email,
        password_hash: 'hashed',
        created_at: new Date(),
        updated_at: new Date(),
      }),
    );

    const result = await useCase.execute(dto);

    expect(createMock).toHaveBeenCalledWith({
      name: dto.name,
      last_name: dto.last_name,
      username: dto.username,
      email: dto.email,
      password_hash: 'hashed',
    });
    expect(result).not.toHaveProperty('password_hash');
    expect(result.id).toBe('id-1');
  });

  it('rejeita username duplicado', async () => {
    repository.findByUsername.mockResolvedValue(new User({ id: 'x' }));
    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(createMock).not.toHaveBeenCalled();
  });

  it('rejeita e-mail duplicado', async () => {
    repository.findByEmail.mockResolvedValue(new User({ id: 'x' }));
    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(createMock).not.toHaveBeenCalled();
  });
});

import { Module } from '@nestjs/common';
import { UserRepository } from '../repositories';
import { PrismaService } from './prisma.service';

export const IUserRepositoryToken = 'IUserRepository';

@Module({
  providers: [
    PrismaService,
    { provide: IUserRepositoryToken, useClass: UserRepository },
  ],
  exports: [PrismaService, IUserRepositoryToken],
})
export class DatabaseModule {}

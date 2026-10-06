import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { LoggerMiddleware } from './presentation/middlewares';
import { HealthController, UserController } from './presentation/controllers';
import {
  CreateUserUseCase,
  ListUserUseCase,
  GetUserByIdUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
} from './application/use-cases';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [HealthController, UserController],
  providers: [
    // Para proteger a API inteira com JWT, registre:
    // { provide: APP_GUARD, useClass: JwtAuthGuard }
    // (JwtAuthGuard em presentation/guards/jwt-auth.guard.ts respeita @Public()).
    CreateUserUseCase,
    ListUserUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

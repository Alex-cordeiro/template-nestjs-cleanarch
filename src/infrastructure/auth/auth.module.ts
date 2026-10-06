import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HashService } from './hash.service';
import { JwtTokenService } from './jwt-token.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
        signOptions: {
          expiresIn: parseInt(
            configService.get<string>('JWT_EXPIRATION') || '604800',
            10,
          ), // 7 days in seconds
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [HashService, JwtTokenService, JwtStrategy],
  exports: [
    HashService,
    JwtTokenService,
    JwtStrategy,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class JwtTokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.parseExpiration(
        this.configService.get<string>('JWT_EXPIRATION'),
        604800,
      ),
    });
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }

  private parseExpiration(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const match = value.match(/^(\d+)([smhd])$/i);
    if (!match) {
      const parsed = parseInt(value, 10);
      return Number.isNaN(parsed) ? fallback : parsed;
    }
    const amount = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    return amount * (multipliers[unit] ?? 1);
  }
}

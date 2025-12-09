import {
  TokenPayload,
  TokenProvider,
} from '@/modules/auth/domain/providers/token.provider';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';

@Injectable()
export class JwtTokenProvider implements TokenProvider {
  constructor(private jwtService: JwtService) {}

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '15m', // Token expiration at 15 minutes
    });
  }
  generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token);
  }
}

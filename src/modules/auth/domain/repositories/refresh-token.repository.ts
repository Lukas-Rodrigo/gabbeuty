import { RefreshToken } from '../entities/refresh-token';

export abstract class RefreshTokenRepository {
  abstract create(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken>;
  abstract findByToken(token: string): Promise<RefreshToken | null>;
  abstract deleteByToken(token: string): Promise<void>;
  abstract deleteAllByUserId(userId: string): Promise<void>;
}

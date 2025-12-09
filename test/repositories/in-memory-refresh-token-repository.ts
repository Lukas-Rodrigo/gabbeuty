import { RefreshToken } from '@/modules/auth/domain/entities/refresh-token';
import { RefreshTokenRepository } from '@/modules/auth/domain/repositories/refresh-token.repository';

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  public tokens: RefreshToken[] = [];

  async create(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const refreshToken = RefreshToken.create({
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    });

    this.tokens.push(refreshToken);
    return refreshToken;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = this.tokens.find((t) => t.token === token);
    return refreshToken ?? null;
  }

  async deleteByToken(token: string): Promise<void> {
    const index = this.tokens.findIndex((t) => t.token === token);
    if (index !== -1) {
      this.tokens.splice(index, 1);
    }
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    this.tokens = this.tokens.filter((t) => t.userId !== userId);
  }
}

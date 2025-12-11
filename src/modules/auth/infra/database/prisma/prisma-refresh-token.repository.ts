import { PrismaService } from '@/infra/database/prisma/prisma.provider';
import { RefreshToken } from '@/modules/auth/domain/entities/refresh-token';
import { RefreshTokenRepository } from '@/modules/auth/domain/repositories/refresh-token.repository';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const refreshToken = await this.prismaService.refreshToken.create({
      data: {
        id: randomUUID(),
        userId,
        token,
        expiresAt,
        createdAt: new Date(),
      },
    });

    return RefreshToken.create(
      {
        userId: refreshToken.userId,
        token: refreshToken.token,
        createdAt: refreshToken.createdAt,
        expiresAt: refreshToken.expiresAt,
      },
      refreshToken.id,
    );
  }
  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.prismaService.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) return null;

    return RefreshToken.create(
      {
        userId: refreshToken.userId,
        token: refreshToken.token,
        createdAt: refreshToken.createdAt,
        expiresAt: refreshToken.expiresAt,
      },
      refreshToken.id,
    );
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prismaService.refreshToken.deleteMany({
      where: { token },
    });
  }
  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prismaService.refreshToken.deleteMany({
      where: { userId },
    });
  }
}

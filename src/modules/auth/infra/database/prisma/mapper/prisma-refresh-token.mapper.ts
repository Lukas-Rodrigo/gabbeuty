import { Prisma } from '@prisma/client';
import { RefreshToken as RefreshTokenPrisma } from '@prisma/client';
import { RefreshToken } from '@/modules/auth/domain/entities/refresh-token';

export class PrismaRefreshTokenMapper {
  static toDomain(raw: Prisma.RefreshTokenUncheckedCreateInput): RefreshToken {
    return RefreshToken.create(
      {
        userId: raw.userId,
        createdAt: new Date(raw.createdAt),
        expiresAt: new Date(raw.expiresAt),
        token: raw.token,
      },
      raw.id,
    );
  }

  static toPrisma(raw: RefreshToken): RefreshTokenPrisma {
    return {
      id: raw.id.toValue(),
      userId: raw.userId,
      token: raw.token,
      createdAt: raw.createdAt,
      expiresAt: raw.expiresAt,
    };
  }
}

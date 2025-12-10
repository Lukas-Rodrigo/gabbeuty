import { Module } from '@nestjs/common';
import { PrismaUsersRepository } from './prisma/prisma-user.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { PrismaRefreshTokenRepository } from './prisma/prisma-refresh-token.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.provider';

@Module({
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: RefreshTokenRepository,
      useClass: PrismaRefreshTokenRepository,
    },
  ],
  exports: [PrismaService, UserRepository, RefreshTokenRepository],
})
export class AuthDatabaseModule {}

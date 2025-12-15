import { Module } from '@nestjs/common';
import { PrismaUsersRepository } from '../../../../infra/database/prisma/prisma-user.repository';
import { UserRepository } from '../../../../_shared/repositories/user.repository';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { PrismaRefreshTokenRepository } from './prisma/prisma-refresh-token.repository';
import { SharedDatabaseModule } from '@/infra/database/@database.module';

@Module({
  imports: [SharedDatabaseModule],
  providers: [
    {
      provide: UserRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: RefreshTokenRepository,
      useClass: PrismaRefreshTokenRepository,
    },
  ],
  exports: [UserRepository, RefreshTokenRepository],
})
export class AuthDatabaseModule {}

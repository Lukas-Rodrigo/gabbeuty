import { Module } from '@nestjs/common';
import { UserRepository } from '../../../../_shared/repositories/user.repository';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { PrismaRefreshTokenRepository } from './prisma/prisma-refresh-token.repository';
import { SharedDatabaseModule } from '@/_shared/_infra/database/@database.module';
import { PrismaUsersRepository } from '@/_shared/_infra/database/prisma/prisma-user.repository';

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

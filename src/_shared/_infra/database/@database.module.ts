import { UserRepository } from '@/_shared/repositories/user.repository';
import { Module } from '@nestjs/common';
import { PrismaUsersRepository } from './prisma/prisma-user.repository';
import { PrismaProvider } from './prisma/prisma.provider';

@Module({
  providers: [
    {
      provide: UserRepository,
      useClass: PrismaUsersRepository,
    },
    PrismaProvider,
  ],
  exports: [UserRepository, PrismaProvider],
})
export class SharedDatabaseModule {}

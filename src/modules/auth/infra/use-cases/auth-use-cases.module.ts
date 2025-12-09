import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/@database.module';
import { AuthProvidersModule } from '../providers/@auth-providers.module';
import { JwtModule } from '../jwt/@jwt.module';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-use';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';

@Module({
  imports: [DatabaseModule, AuthProvidersModule, JwtModule],
  providers: [
    CreateUserUseCase,
    LogoutUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
  ],
  exports: [
    CreateUserUseCase,
    LogoutUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
  ],
})
export class AuthUseCasesModules {}

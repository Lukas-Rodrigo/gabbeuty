import { Module } from '@nestjs/common';
import { HashProvider } from '../../domain/providers/hash.provider';
import { BcryptHashProvider } from './bcrypt-hash.provider';
import { TokenProvider } from '../../domain/providers/token.provider';
import { JwtTokenProvider } from './token.provider';

@Module({
  imports: [],
  providers: [
    {
      provide: HashProvider,
      useClass: BcryptHashProvider,
    },
    {
      provide: TokenProvider,
      useClass: JwtTokenProvider,
    },
  ],
  exports: [HashProvider, TokenProvider],
})
export class AuthProvidersModule {}

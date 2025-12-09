import { Injectable, Logger } from '@nestjs/common';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { Either, right } from '@/_shared/either';

export interface LogoutInput {
  refreshToken: string;
}

export type LogoutOutput = Either<null, null>;

@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(private refreshTokenRepository: RefreshTokenRepository) {}

  async execute(input: LogoutInput): Promise<LogoutOutput> {
    this.logger.log('User logout: invalidating refresh token');
    await this.refreshTokenRepository.deleteByToken(input.refreshToken);
    this.logger.log('Logout successful');

    return right(null);
  }
}

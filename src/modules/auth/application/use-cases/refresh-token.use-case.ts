import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../../../_shared/repositories/user.repository';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { TokenProvider } from '../../domain/providers/token.provider';
import { Either, left, right } from '@/_shared/either';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { TokenExpiredError } from '@/_shared/errors/token-expired-error';

export interface RefreshTokenInput {
  refreshToken: string;
}

export type RefreshTokenOutput = Either<
  ResourceNotFoundError | TokenExpiredError,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private tokenProvider: TokenProvider,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    this.logger.log('Attempting to refresh access token');

    const storedToken = await this.refreshTokenRepository.findByToken(
      input.refreshToken,
    );

    if (!storedToken || storedToken.isExpired()) {
      this.logger.warn('Token refresh failed: token invalid or expired');
      return left(new TokenExpiredError());
    }

    const user = await this.userRepository.findById(storedToken.userId);

    if (!user) {
      this.logger.error(
        `Token refresh failed: user not found - userId: ${storedToken.userId}`,
      );
      return left(
        new ResourceNotFoundError({
          msg: 'User not found error.',
        }),
      );
    }

    // Generated new tokens
    const accessToken = await this.tokenProvider.generateAccessToken({
      sub: user.id.toValue(),
      email: user.email,
    });

    const newRefreshToken = this.tokenProvider.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.deleteByToken(input.refreshToken);
    await this.refreshTokenRepository.create(
      user.id.toValue(),
      newRefreshToken,
      expiresAt,
    );

    this.logger.log(
      `Token refreshed successfully for user: ${user.id.toValue()}`,
    );

    return right({
      accessToken,
      refreshToken: newRefreshToken,
    });
  }
}

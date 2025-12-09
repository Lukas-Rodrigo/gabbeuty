import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { HashProvider } from '../../domain/providers/hash.provider';
import { TokenProvider } from '../../domain/providers/token.provider';
import { Either, left, right } from '@/_shared/either';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';

export interface LoginInput {
  email: string;
  password: string;
}

export type LoginOutput = Either<
  ResourceNotFoundError,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private hashProvider: HashProvider,
    private tokenProvider: TokenProvider,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    this.logger.log(`Login attempt for email: ${input.email}`);

    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      this.logger.warn(`Login failed: user not found - ${input.email}`);
      return left(
        new ResourceNotFoundError({
          msg: 'Wrong credentials error.',
        }),
      );
    }

    const isPasswordValid = await this.hashProvider.compare(
      input.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: invalid password - ${input.email}`);
      return left(
        new ResourceNotFoundError({
          msg: 'Wrong credentials error.',
        }),
      );
    }

    const accessToken = await this.tokenProvider.generateAccessToken({
      sub: user.id.toValue(),
      email: user.email,
    });

    const refreshToken = this.tokenProvider.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepository.create(
      user.id.toValue(),
      refreshToken,
      expiresAt,
    );

    this.logger.log(`Login successful for user: ${user.id.toValue()}`);

    return right({
      accessToken,
      refreshToken,
    });
  }
}

import { describe, it, expect, beforeEach } from 'vitest';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository';
import { InMemoryRefreshTokenRepository } from '@test/repositories/in-memory-refresh-token-repository';
import { FakeEncrypter } from '@test/cryptography/fake-encrypter';
import { makeUser } from '@test/factories/make-user';
import { faker } from '@faker-js/faker';

let userRepository: InMemoryUserRepository;
let refreshTokenRepository: InMemoryRefreshTokenRepository;
let tokenProvider: FakeEncrypter;
let sut: RefreshTokenUseCase;

describe('RefreshTokenUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    tokenProvider = new FakeEncrypter();
    sut = new RefreshTokenUseCase(
      userRepository,
      refreshTokenRepository,
      tokenProvider,
    );
  });

  it('should be able to refresh access token with valid refresh token', async () => {
    const user = makeUser();
    const createdUser = await userRepository.create(
      user.name,
      user.email,
      user.password,
    );

    const refreshToken = tokenProvider.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await refreshTokenRepository.create(
      createdUser.id.toValue(),
      refreshToken,
      expiresAt,
    );

    const result = await sut.execute({ refreshToken });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.accessToken).toBeTruthy();
      expect(result.value.refreshToken).toBeTruthy();
      expect(result.value.refreshToken).not.toBe(refreshToken);
    }
  });

  it('should not be able to refresh with invalid token', async () => {
    const result = await sut.execute({
      refreshToken: faker.string.alphanumeric(32),
    });

    expect(result.isLeft()).toBe(true);
  });

  it('should not be able to refresh with expired token', async () => {
    const user = makeUser();
    const createdUser = await userRepository.create(
      user.name,
      user.email,
      user.password,
    );

    const refreshToken = tokenProvider.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() - 1);

    await refreshTokenRepository.create(
      createdUser.id.toValue(),
      refreshToken,
      expiresAt,
    );

    const result = await sut.execute({ refreshToken });

    expect(result.isLeft()).toBe(true);
  });

  it('should delete old refresh token after successful refresh', async () => {
    const user = makeUser();
    const createdUser = await userRepository.create(
      user.name,
      user.email,
      user.password,
    );

    const refreshToken = tokenProvider.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await refreshTokenRepository.create(
      createdUser.id.toValue(),
      refreshToken,
      expiresAt,
    );

    expect(refreshTokenRepository.tokens).toHaveLength(1);

    await sut.execute({ refreshToken });

    const oldToken = await refreshTokenRepository.findByToken(refreshToken);
    expect(oldToken).toBeNull();
  });

  it('should create new refresh token after successful refresh', async () => {
    const user = makeUser();
    const createdUser = await userRepository.create(
      user.name,
      user.email,
      user.password,
    );

    const refreshToken = tokenProvider.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await refreshTokenRepository.create(
      createdUser.id.toValue(),
      refreshToken,
      expiresAt,
    );

    const result = await sut.execute({ refreshToken });

    expect(result.isRight()).toBe(true);
    expect(refreshTokenRepository.tokens).toHaveLength(1);
    expect(refreshTokenRepository.tokens[0].token).not.toBe(refreshToken);
  });
});

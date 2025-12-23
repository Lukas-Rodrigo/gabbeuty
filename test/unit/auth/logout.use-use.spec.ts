import { describe, it, expect, beforeEach } from 'vitest';
import { LogoutUseCase } from '@/modules/auth/application/use-cases/logout.use-use';
import { InMemoryRefreshTokenRepository } from '@test/helpers/mocks/repositories/in-memory-refresh-token-repository';
import { FakeEncrypter } from '@test/helpers/mocks/cryptography/fake-encrypter';
import { faker } from '@faker-js/faker';

let refreshTokenRepository: InMemoryRefreshTokenRepository;
let tokenProvider: FakeEncrypter;
let sut: LogoutUseCase;

describe('LogoutUseCase', () => {
  beforeEach(() => {
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    tokenProvider = new FakeEncrypter();
    sut = new LogoutUseCase(refreshTokenRepository);
  });

  it('should be able to logout by deleting refresh token', async () => {
    const userId = faker.string.uuid();
    const refreshToken = tokenProvider.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await refreshTokenRepository.create(userId, refreshToken, expiresAt);

    expect(refreshTokenRepository.tokens).toHaveLength(1);

    const result = await sut.execute({ refreshToken });

    expect(result.isRight()).toBe(true);
    expect(refreshTokenRepository.tokens).toHaveLength(0);
  });

  it('should not throw error when trying to delete non-existent token', async () => {
    const result = await sut.execute({
      refreshToken: faker.string.alphanumeric(32),
    });

    expect(result.isRight()).toBe(true);
  });
});

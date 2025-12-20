import { describe, it, expect, beforeEach } from 'vitest';
import { LoginUseCase } from '@/modules/auth/application/use-cases/login.use-case';
import { InMemoryUserRepository } from '@test/helpers/mocks/repositories/in-memory-user-repository';
import { InMemoryRefreshTokenRepository } from '@test/helpers/mocks/repositories/in-memory-refresh-token-repository';
import { FakeHasher } from '@test/helpers/mocks/cryptography/fake-hasher';
import { FakeEncrypter } from '@test/helpers/mocks/cryptography/fake-encrypter';
import { makeUser } from '@test/helpers/factories/make-user';
import { faker } from '@faker-js/faker';

let userRepository: InMemoryUserRepository;
let refreshTokenRepository: InMemoryRefreshTokenRepository;
let hashProvider: FakeHasher;
let tokenProvider: FakeEncrypter;
let sut: LoginUseCase;

describe('LoginUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    hashProvider = new FakeHasher();
    tokenProvider = new FakeEncrypter();
    sut = new LoginUseCase(
      userRepository,
      refreshTokenRepository,
      hashProvider,
      tokenProvider,
    );
  });

  it('should be able to authenticate with valid credentials', async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const hashedPassword = await hashProvider.hash(password);

    const user = makeUser({ email, password: hashedPassword });
    await userRepository.create(user.name, user.email, user.password);

    const result = await sut.execute({
      email,
      password,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.accessToken).toBeTruthy();
      expect(result.value.refreshToken).toBeTruthy();
    }
  });

  it('should not be able to authenticate with wrong email', async () => {
    const result = await sut.execute({
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    expect(result.isLeft()).toBe(true);
  });

  it('should not be able to authenticate with wrong password', async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const hashedPassword = await hashProvider.hash(password);

    const user = makeUser({ email, password: hashedPassword });
    await userRepository.create(user.name, user.email, user.password);

    const result = await sut.execute({
      email,
      password: 'wrong-password',
    });

    expect(result.isLeft()).toBe(true);
  });

  it('should create a refresh token on successful login', async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const hashedPassword = await hashProvider.hash(password);

    const user = makeUser({ email, password: hashedPassword });
    await userRepository.create(user.name, user.email, user.password);

    const result = await sut.execute({
      email,
      password,
    });

    expect(result.isRight()).toBe(true);
    expect(refreshTokenRepository.tokens).toHaveLength(1);
  });
});

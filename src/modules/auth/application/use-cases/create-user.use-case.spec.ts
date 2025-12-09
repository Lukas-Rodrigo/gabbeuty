import { describe, it, expect, beforeEach } from 'vitest';
import { CreateUserUseCase } from './create-user.use-case';
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository';
import { FakeHasher } from '@test/cryptography/fake-hasher';
import { makeUser } from '@test/factories/make-user';
import { faker } from '@faker-js/faker';

let userRepository: InMemoryUserRepository;
let hashProvider: FakeHasher;
let sut: CreateUserUseCase;

describe('CreateUserUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    hashProvider = new FakeHasher();
    sut = new CreateUserUseCase(userRepository, hashProvider);
  });

  it('should be able to create a new user', async () => {
    const name = faker.person.fullName();
    const email = faker.internet.email();
    const password = faker.internet.password();

    const result = await sut.execute({
      name,
      email,
      password,
    });

    expect(result.isRight()).toBe(true);
    expect(userRepository.users).toHaveLength(1);
    expect(userRepository.users[0].email).toBe(email);
    expect(userRepository.users[0].name).toBe(name);
  });

  it('should hash user password upon registration', async () => {
    const name = faker.person.fullName();
    const email = faker.internet.email();
    const password = faker.internet.password();

    const result = await sut.execute({
      name,
      email,
      password,
    });

    const hashedPassword = await hashProvider.hash(password);

    expect(result.isRight()).toBe(true);
    expect(userRepository.users[0].password).toBe(hashedPassword);
  });

  it('should not be able to create a user with same email', async () => {
    const email = faker.internet.email();

    const existingUser = makeUser({ email });
    await userRepository.create(
      existingUser.name,
      existingUser.email,
      existingUser.password,
    );

    const result = await sut.execute({
      name: faker.person.fullName(),
      email,
      password: faker.internet.password(),
    });

    expect(result.isLeft()).toBe(true);
    expect(userRepository.users).toHaveLength(1);
  });
});

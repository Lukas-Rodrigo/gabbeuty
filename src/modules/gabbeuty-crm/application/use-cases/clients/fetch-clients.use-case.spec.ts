import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { FetchClientsUseCase } from './fetch-clients.use-case';
import { faker } from '@faker-js/faker';
import { Client } from '@/modules/gabbeuty-crm/domain/entities/client.entity';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';

describe('[Unit] FetchClientsUseCase', () => {
  let clientsRepository: InMemoryClientsRepository;
  let userRepository: InMemoryUserRepository;
  let sut: FetchClientsUseCase;

  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    userRepository = new InMemoryUserRepository();
    sut = new FetchClientsUseCase(userRepository, clientsRepository);
  });

  it('should fetch all clients for a professional', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const professionalId = user.id.toValue();

    // Create 3 clients
    for (let i = 0; i < 3; i++) {
      const client = Client.create({
        name: faker.person.fullName(),
        phoneNumber: `+551199999999${i}`,
        professionalId: new UniqueEntityID(professionalId),
      });
      await clientsRepository.create(client);
    }

    const result = await sut.handle({
      professionalId,
      dateRange: {},
      pagination: { page: 1, perPage: 10 },
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.clients).toHaveLength(3);
    }
  });

  it('should return error if professional not found', async () => {
    const result = await sut.handle({
      professionalId: faker.string.uuid(),
      dateRange: {},
      pagination: { page: 1, perPage: 10 },
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return empty list if professional has no clients', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const result = await sut.handle({
      professionalId: user.id.toValue(),
      dateRange: {},
      pagination: { page: 1, perPage: 10 },
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.clients).toHaveLength(0);
    }
  });
});

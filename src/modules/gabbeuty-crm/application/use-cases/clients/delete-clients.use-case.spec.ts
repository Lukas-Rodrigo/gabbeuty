import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { DeleteClientsUseCase } from './delete-clients.use-case';
import { faker } from '@faker-js/faker';
import { Client } from '@/modules/gabbeuty-crm/domain/entities/client.entity';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { NotBelongsError } from '@/_shared/errors/not-belongs.error';

describe('[Unit] DeleteClientsUseCase', () => {
  let clientsRepository: InMemoryClientsRepository;
  let userRepository: InMemoryUserRepository;
  let sut: DeleteClientsUseCase;

  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    userRepository = new InMemoryUserRepository();
    sut = new DeleteClientsUseCase(clientsRepository, userRepository);
  });

  it('should delete a client successfully', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const client = Client.create({
      name: faker.person.fullName(),
      phoneNumber: '+5511999999999',
      professionalId: new UniqueEntityID(user.id.toValue()),
    });
    await clientsRepository.create(client);

    const result = await sut.handle({
      clientId: client.id.toValue(),
      professionalId: user.id.toValue(),
    });

    expect(result.isRight()).toBe(true);
    expect(clientsRepository.clients).toHaveLength(0);
  });

  it('should return error if professional not found', async () => {
    const result = await sut.handle({
      clientId: faker.string.uuid(),
      professionalId: faker.string.uuid(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return error if client not found', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const result = await sut.handle({
      clientId: faker.string.uuid(),
      professionalId: user.id.toValue(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return error if client does not belong to professional', async () => {
    const user1 = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const user2 = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password456',
    );

    const client = Client.create({
      name: faker.person.fullName(),
      phoneNumber: '+5511999999999',
      professionalId: new UniqueEntityID(user1.id.toValue()),
    });
    await clientsRepository.create(client);

    const result = await sut.handle({
      clientId: client.id.toValue(),
      professionalId: user2.id.toValue(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotBelongsError);
  });
});

import { InMemoryClientsRepository } from '@test/helpers/mocks/repositories/in-memory-clients-repository';
import { InMemoryUserRepository } from '@test/helpers/mocks/repositories/in-memory-user-repository';
import { PatchClientsUseCase } from '@/modules/gabbeuty-crm/application/use-cases/clients/patch-clients.use-case';
import { faker } from '@faker-js/faker';
import { Client } from '@/modules/gabbeuty-crm/domain/entities/client.entity';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { NotBelongsError } from '@/_shared/errors/not-belongs.error';

describe('[Unit] PatchClientsUseCase', () => {
  let clientsRepository: InMemoryClientsRepository;
  let userRepository: InMemoryUserRepository;
  let sut: PatchClientsUseCase;

  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    userRepository = new InMemoryUserRepository();
    sut = new PatchClientsUseCase(userRepository, clientsRepository);
  });

  it('should update client name successfully', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const client = Client.create({
      name: 'Old Name',
      phoneNumber: '+5511999999999',
      professionalId: new UniqueEntityID(user.id.toValue()),
    });
    await clientsRepository.create(client);

    const result = await sut.execute({
      clientId: client.id.toValue(),
      professionalId: user.id.toValue(),
      data: { name: 'New Name' },
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.client.name).toBe('New Name');
    }
  });

  it('should return error if professional not found', async () => {
    const result = await sut.execute({
      clientId: faker.string.uuid(),
      professionalId: faker.string.uuid(),
      data: { name: 'Test' },
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

    const result = await sut.execute({
      clientId: faker.string.uuid(),
      professionalId: user.id.toValue(),
      data: { name: 'Test' },
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

    const result = await sut.execute({
      clientId: client.id.toValue(),
      professionalId: user2.id.toValue(),
      data: { name: 'New Name' },
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotBelongsError);
  });

  // it('should return error if phone number and name already exist', async () => {
  //   const user = await userRepository.create(
  //     faker.person.fullName(),
  //     faker.internet.email(),
  //     'password123',
  //   );

  //   const client1 = Client.create({
  //     name: 'Duplicate Name',
  //     phoneNumber: '+5511999999999',
  //     professionalId: new UniqueEntityID(user.id.toValue()),
  //   });
  //   await clientsRepository.create(client1);

  //   const client2 = Client.create({
  //     name: 'Client 2',
  //     phoneNumber: '+5511888888888',
  //     professionalId: new UniqueEntityID(user.id.toValue()),
  //   });
  //   await clientsRepository.create(client2);

  //   const result = await sut.execute({
  //     clientId: client2.id.toValue(),
  //     professionalId: user.id.toValue(),
  //     data: {
  //       phoneNumber: '+5511999999999',
  //       name: 'Duplicate Name',
  //     },
  //   });

  //   console.log(result);

  //   expect(result.isLeft()).toBe(true);
  //   expect(result.value).toBeInstanceOf(AlreadyExists);
  // });
});

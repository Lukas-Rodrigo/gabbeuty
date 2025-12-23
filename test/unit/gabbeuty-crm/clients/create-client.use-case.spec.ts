import { InMemoryClientsRepository } from '@test/helpers/mocks/repositories/in-memory-clients-repository';
import { CreateClientUseCase } from '@/modules/gabbeuty-crm/application/use-cases/clients/create-client.use-case';
import { faker } from '@faker-js/faker';
import { AlreadyExists } from '@/_shared/errors/already-exists.error';

describe('[Unit] CreateClientUseCase', () => {
  let clientsRepository: InMemoryClientsRepository;
  let sut: CreateClientUseCase;

  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    sut = new CreateClientUseCase(clientsRepository);
  });

  it('should create a client successfully', async () => {
    const result = await sut.execute({
      name: faker.person.fullName(),
      phoneNumber: '+5511999999999',
      professionalId: faker.string.uuid(),
    });

    expect(result.isRight()).toBe(true);
    expect(clientsRepository.clients).toHaveLength(1);
  });

  it('should not create a client with duplicate phone number and name', async () => {
    const professionalId = faker.string.uuid();
    const phoneNumber = '+5511999999999';
    const name = faker.person.fullName();

    await sut.execute({
      name,
      phoneNumber,
      professionalId,
    });

    const result = await sut.execute({
      name,
      phoneNumber,
      professionalId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExists);
    expect(clientsRepository.clients).toHaveLength(1);
  });

  it('should create a client with optional fields', async () => {
    const result = await sut.execute({
      name: faker.person.fullName(),
      phoneNumber: '+5511999999999',
      professionalId: faker.string.uuid(),
      observation: 'Test observation',
      profileUrl: faker.image.avatar(),
    });

    expect(result.isRight()).toBe(true);
    expect(clientsRepository.clients).toHaveLength(1);
    expect(clientsRepository.clients[0].observation).toBe('Test observation');
  });
});

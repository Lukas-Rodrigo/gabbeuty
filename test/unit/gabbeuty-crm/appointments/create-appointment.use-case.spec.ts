import { InMemoryAppointmentsRepository } from '@test/helpers/mocks/repositories/in-memory-appointments-repository';
import { InMemoryBusinessServicesRepository } from '@test/helpers/mocks/repositories/in-memory-business-services-repository';
import { InMemoryClientsRepository } from '@test/helpers/mocks/repositories/in-memory-clients-repository';
import { InMemoryUserRepository } from '@test/helpers/mocks/repositories/in-memory-user-repository';
import { CreateAppointmentUseCase } from '@/modules/gabbeuty-crm/application/use-cases/appointments/create-appointment.use-case';
import { faker } from '@faker-js/faker';
import { Client } from '@/modules/gabbeuty-crm/domain/entities/client.entity';
import { BusinessService } from '@/modules/gabbeuty-crm/domain/entities/business-service.entity';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { NotBelongsError } from '@/_shared/errors/not-belongs.error';

describe('[Unit] CreateAppointmentUseCase', () => {
  let appointmentsRepository: InMemoryAppointmentsRepository;
  let userRepository: InMemoryUserRepository;
  let clientsRepository: InMemoryClientsRepository;
  let businessServicesRepository: InMemoryBusinessServicesRepository;
  let sut: CreateAppointmentUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    clientsRepository = new InMemoryClientsRepository();
    businessServicesRepository = new InMemoryBusinessServicesRepository();
    appointmentsRepository = new InMemoryAppointmentsRepository(
      clientsRepository,
      businessServicesRepository,
    );
    sut = new CreateAppointmentUseCase(
      appointmentsRepository,
      userRepository,
      clientsRepository,
      businessServicesRepository,
    );
  });

  it('should create an appointment successfully', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const professionalId = user.id.toValue();

    const client = Client.create({
      name: faker.person.fullName(),
      phoneNumber: '+5511999999999',
      professionalId: new UniqueEntityID(professionalId),
    });
    await clientsRepository.create(client);

    const service = BusinessService.create({
      name: 'Haircut',
      price: 50,
      professionalId: new UniqueEntityID(professionalId),
      duration: 60,
    });
    await businessServicesRepository.create(service);
    const date = new Date();
    date.setDate(new Date().getDate() + 3);
    const result = await sut.execute({
      date,
      professionalId,
      clientId: client.id.toValue(),
      servicesIds: [service.id.toValue()],
    });

    expect(result.isRight()).toBe(true);
    expect(appointmentsRepository.appointments).toHaveLength(1);
  });

  it('should return error if professional not found', async () => {
    const result = await sut.execute({
      date: new Date(),
      professionalId: faker.string.uuid(),
      clientId: faker.string.uuid(),
      servicesIds: [faker.string.uuid()],
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
      date: new Date(),
      professionalId: user.id.toValue(),
      clientId: faker.string.uuid(),
      servicesIds: [faker.string.uuid()],
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
      date: new Date(),
      professionalId: user2.id.toValue(),
      clientId: client.id.toValue(),
      servicesIds: [faker.string.uuid()],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotBelongsError);
  });

  it('should return error if service not found', async () => {
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

    const result = await sut.execute({
      date: new Date(),
      professionalId: user.id.toValue(),
      clientId: client.id.toValue(),
      servicesIds: [faker.string.uuid()],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});

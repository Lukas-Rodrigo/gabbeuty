import { InMemoryBusinessServicesRepository } from '@test/helpers/mocks/repositories/in-memory-business-services-repository';
import { InMemoryUserRepository } from '@test/helpers/mocks/repositories/in-memory-user-repository';
import { DeleteBusinessServicesUseCase } from '@/modules/gabbeuty-crm/application/use-cases/business-service/delete-business-services.use-case';
import { faker } from '@faker-js/faker';
import { BusinessService } from '@/modules/gabbeuty-crm/domain/entities/business-service.entity';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { NotBelongsError } from '@/_shared/errors/not-belongs.error';

describe('[Unit] DeleteBusinessServicesUseCase', () => {
  let businessServicesRepository: InMemoryBusinessServicesRepository;
  let userRepository: InMemoryUserRepository;
  let sut: DeleteBusinessServicesUseCase;

  beforeEach(() => {
    businessServicesRepository = new InMemoryBusinessServicesRepository();
    userRepository = new InMemoryUserRepository();
    sut = new DeleteBusinessServicesUseCase(
      userRepository,
      businessServicesRepository,
    );
  });

  it('should delete a business service successfully', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const service = BusinessService.create({
      name: 'Haircut',
      price: 50,
      professionalId: new UniqueEntityID(user.id.toValue()),
      duration: 60,
    });
    await businessServicesRepository.create(service);

    const result = await sut.execute({
      id: service.id.toValue(),
      professionalId: user.id.toValue(),
    });

    expect(result.isRight()).toBe(true);
    expect(
      businessServicesRepository.businessServices[0].deletedAt,
    ).toBeDefined();
  });

  it('should return error if professional not found', async () => {
    const result = await sut.execute({
      id: faker.string.uuid(),
      professionalId: faker.string.uuid(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return error if service not found', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const result = await sut.execute({
      id: faker.string.uuid(),
      professionalId: user.id.toValue(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return error if service does not belong to professional', async () => {
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

    const service = BusinessService.create({
      name: 'Haircut',
      price: 50,
      professionalId: new UniqueEntityID(user1.id.toValue()),
      duration: 60,
    });
    await businessServicesRepository.create(service);

    const result = await sut.execute({
      id: service.id.toValue(),
      professionalId: user2.id.toValue(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotBelongsError);
  });
});

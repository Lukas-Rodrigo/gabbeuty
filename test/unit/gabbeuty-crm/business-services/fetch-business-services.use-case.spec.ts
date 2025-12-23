import { InMemoryBusinessServicesRepository } from '@test/helpers/mocks/repositories/in-memory-business-services-repository';
import { InMemoryUserRepository } from '@test/helpers/mocks/repositories/in-memory-user-repository';
import { FetchBusinessServicesUseCase } from '@/modules/gabbeuty-crm/application/use-cases/business-service/fetch-business-services.use-case';
import { faker } from '@faker-js/faker';
import { BusinessService } from '@/modules/gabbeuty-crm/domain/entities/business-service.entity';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';

describe('[Unit] FetchBusinessServicesUseCase', () => {
  let businessServicesRepository: InMemoryBusinessServicesRepository;
  let userRepository: InMemoryUserRepository;
  let sut: FetchBusinessServicesUseCase;

  beforeEach(() => {
    businessServicesRepository = new InMemoryBusinessServicesRepository();
    userRepository = new InMemoryUserRepository();
    sut = new FetchBusinessServicesUseCase(
      userRepository,
      businessServicesRepository,
    );
  });

  it('should fetch all business services for a professional', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const professionalId = user.id.toValue();

    // Create 3 services
    for (let i = 0; i < 3; i++) {
      const service = BusinessService.create({
        name: `Service ${i}`,
        price: 50 + i * 10,
        professionalId: new UniqueEntityID(professionalId),
        duration: 60,
      });
      await businessServicesRepository.create(service);
    }

    const result = await sut.execute({
      professionalId,
      pagination: { page: 1, perPage: 10 },
      dateRange: {},
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.businessServices).toHaveLength(3);
    }
  });

  it('should return error if professional not found', async () => {
    const result = await sut.execute({
      professionalId: faker.string.uuid(),
      pagination: { page: 1, perPage: 10 },
      dateRange: {},
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return empty list if professional has no services', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const result = await sut.execute({
      professionalId: user.id.toValue(),
      pagination: { page: 1, perPage: 10 },
      dateRange: {},
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.businessServices).toHaveLength(0);
    }
  });
});

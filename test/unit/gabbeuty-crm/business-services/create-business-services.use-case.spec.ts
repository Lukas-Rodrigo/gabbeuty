import { InMemoryBusinessServicesRepository } from '@test/helpers/mocks/repositories/in-memory-business-services-repository';
import { InMemoryUserRepository } from '@test/helpers/mocks/repositories/in-memory-user-repository';
import { CreateBusinessServicesUseCase } from '@/modules/gabbeuty-crm/application/use-cases/business-service/create-business-services.use-case';
import { faker } from '@faker-js/faker';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';

describe('[Unit] CreateBusinessServicesUseCase', () => {
  let businessServicesRepository: InMemoryBusinessServicesRepository;
  let userRepository: InMemoryUserRepository;
  let sut: CreateBusinessServicesUseCase;

  beforeEach(() => {
    businessServicesRepository = new InMemoryBusinessServicesRepository();
    userRepository = new InMemoryUserRepository();
    sut = new CreateBusinessServicesUseCase(
      userRepository,
      businessServicesRepository,
    );
  });

  it('should create a business service successfully', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const result = await sut.execute({
      professionalId: user.id.toValue(),
      data: {
        name: 'Haircut',
        price: 50,
      },
    });

    expect(result.isRight()).toBe(true);
    expect(businessServicesRepository.businessServices).toHaveLength(1);
  });

  it('should return error if professional not found', async () => {
    const result = await sut.execute({
      professionalId: faker.string.uuid(),
      data: {
        name: 'Haircut',
        price: 50,
      },
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});

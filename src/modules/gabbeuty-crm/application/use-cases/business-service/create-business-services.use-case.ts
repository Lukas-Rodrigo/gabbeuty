import { Either, left, right } from '@/_shared/either';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { UserRepository } from '@/_shared/repositories/user.repository';
import { UniqueEntityID } from '@/_shared/value-objects/unique-entity-id.vo';
import { BusinessService } from '@/modules/gabbeuty-crm/domain/entities/business-service.entity';
import { BusinessServicesRepository } from '@/modules/gabbeuty-crm/domain/repositories/business-services.repository';
import { Injectable } from '@nestjs/common';

export interface CreateBusinessServicesUseCaseRequest {
  professionalId: string;
  data: {
    name: string;
    price: number;
  };
}

type CreateBusinessServicesUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>;

@Injectable()
export class CreateBusinessServicesUseCase {
  constructor(
    private userRepository: UserRepository,
    private businessServicesRepository: BusinessServicesRepository,
  ) {}

  async execute({
    professionalId,
    data,
  }: CreateBusinessServicesUseCaseRequest): Promise<CreateBusinessServicesUseCaseResponse> {
    const isValidProfessional =
      await this.userRepository.findById(professionalId);

    if (!isValidProfessional) {
      return left(
        new ResourceNotFoundError({
          msg: 'User not found error.',
        }),
      );
    }
    const { name, price } = data;
    const businessService = BusinessService.create({
      name,
      price,
      professionalId: new UniqueEntityID(professionalId),
      duration: 60,
    });

    await this.businessServicesRepository.create(businessService);

    return right(null);
  }
}

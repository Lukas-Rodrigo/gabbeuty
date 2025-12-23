import { Either, left, right } from '@/_shared/either';
import { NotBelongsError } from '@/_shared/errors/not-belongs.error';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { UserRepository } from '@/_shared/repositories/user.repository';
import { BusinessService } from '@/modules/gabbeuty-crm/domain/entities/business-service.entity';
import { BusinessServicesRepository } from '@/modules/gabbeuty-crm/domain/repositories/business-services.repository';
import { Injectable } from '@nestjs/common';

export interface PatchBusinessServicesUseCaseRequest {
  professionalId: string;
  id: string;
  data: {
    name?: string;
    price?: number;
  };
}

type PatchBusinessServicesUseCaseResponse = Either<
  ResourceNotFoundError | NotBelongsError,
  {
    businessService: BusinessService;
  }
>;

@Injectable()
export class PatchBusinessServicesUseCase {
  constructor(
    private businessServiceRepository: BusinessServicesRepository,
    private userRepository: UserRepository,
  ) {}
  async execute({
    professionalId,
    id,
    data,
  }: PatchBusinessServicesUseCaseRequest): Promise<PatchBusinessServicesUseCaseResponse> {
    const isValidProfessional =
      await this.userRepository.findById(professionalId);

    // Validate professional
    if (!isValidProfessional) {
      return left(
        new ResourceNotFoundError({
          msg: 'User not found error.',
        }),
      );
    }

    const isValidBusinessServices =
      await this.businessServiceRepository.findById(id);

    if (!isValidBusinessServices) {
      return left(
        new ResourceNotFoundError({
          msg: 'Service not found error.',
        }),
      );
    }

    if (isValidBusinessServices.professionalId.toValue() !== professionalId) {
      return left(
        new NotBelongsError({
          msg: 'Service does not belong to the user.',
        }),
      );
    }

    const { name, price } = data;

    if (name !== undefined) {
      isValidBusinessServices.updateName(name);
    }

    if (price !== undefined) {
      isValidBusinessServices.updatePrice(price);
    }

    await this.businessServiceRepository.save(id, isValidBusinessServices);

    return right({
      businessService: isValidBusinessServices,
    });
  }
}

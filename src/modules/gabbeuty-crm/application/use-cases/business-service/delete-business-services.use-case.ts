import { Either, left, right } from '@/_shared/either';
import { NotBelongsError } from '@/_shared/errors/not-belongs.error';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { UserRepository } from '@/_shared/repositories/user.repository';
import { BusinessServicesRepository } from '@/modules/gabbeuty-crm/domain/repositories/business-services.repository';
import { Injectable } from '@nestjs/common';

interface DeleteBusinessServicesUseCaseRequest {
  professionalId: string;
  id: string;
}

type DeleteBusinessServicesUseCaseResponse = Either<
  ResourceNotFoundError | NotBelongsError,
  null
>;

@Injectable()
export class DeleteBusinessServicesUseCase {
  constructor(
    private userRepository: UserRepository,
    private businessServicesRepository: BusinessServicesRepository,
  ) {}

  async execute({
    professionalId,
    id,
  }: DeleteBusinessServicesUseCaseRequest): Promise<DeleteBusinessServicesUseCaseResponse> {
    const isValidProfessional =
      await this.userRepository.findById(professionalId);

    if (!isValidProfessional) {
      return left(
        new ResourceNotFoundError({
          msg: 'User not found error.',
        }),
      );
    }

    const isValidService = await this.businessServicesRepository.findById(id);

    if (!isValidService) {
      return left(
        new ResourceNotFoundError({
          msg: 'Service not found error.',
        }),
      );
    }

    if (isValidService.professionalId.toValue() !== professionalId) {
      return left(
        new NotBelongsError({
          msg: 'Service does not belong to the user.',
        }),
      );
    }

    isValidService.delete();
    await this.businessServicesRepository.save(id, isValidService);

    return right(null);
  }
}

import { Either, left, right } from '@/_shared/either';
import { DateRange } from '@/_shared/entities/date-range';
import { PaginationParam } from '@/_shared/entities/pagination-param';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { UserRepository } from '@/_shared/repositories/user.repository';
import { BusinessService } from '@/modules/gabbeuty-crm/domain/entities/business-service.entity';
import { BusinessServicesRepository } from '@/modules/gabbeuty-crm/domain/repositories/business-services.repository';
import { Injectable } from '@nestjs/common';

export interface FetchBusinessServicesUseCaseRequest {
  professionalId: string;
  pagination: PaginationParam;
  dateRange: DateRange;
}

type FetchBusinessServicesUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    businessServices: BusinessService[];
  }
>;

@Injectable()
export class FetchBusinessServicesUseCase {
  constructor(
    private userRepository: UserRepository,
    private businessServicesRepository: BusinessServicesRepository,
  ) {}

  async execute({
    professionalId,
    pagination,
    dateRange,
  }: FetchBusinessServicesUseCaseRequest): Promise<FetchBusinessServicesUseCaseResponse> {
    const isValidProfessional =
      await this.userRepository.findById(professionalId);

    if (!isValidProfessional) {
      return left(
        new ResourceNotFoundError({
          msg: 'User not found error.',
        }),
      );
    }

    const businessServices =
      await this.businessServicesRepository.findByProfessionalId(
        professionalId,
        pagination,
        dateRange,
      );

    return right({
      businessServices,
    });
  }
}

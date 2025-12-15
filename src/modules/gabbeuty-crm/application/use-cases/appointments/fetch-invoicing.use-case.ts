import { Either, left, right } from '@/_shared/either';
import { DateRange } from '@/_shared/entities/date-range';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { UserRepository } from '@/_shared/repositories/user.repository';
import { AppointmentsRepository } from '@/modules/gabbeuty-crm/domain/repositories/appointments.repository';
import { Injectable } from '@nestjs/common';

export interface FetchInvoicingUseCaseRequest {
  professionalId: string;
  dateRange: DateRange;
}

type FetchInvoicingUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    invoicing: number;
  }
>;

@Injectable()
export class FetchInvoicingUseCase {
  constructor(
    private userRepository: UserRepository,
    private appointmentsRepository: AppointmentsRepository,
  ) {}

  async execute({
    professionalId,
    dateRange,
  }: FetchInvoicingUseCaseRequest): Promise<FetchInvoicingUseCaseResponse> {
    const isValidProfessional =
      await this.userRepository.findById(professionalId);

    if (!isValidProfessional) {
      return left(
        new ResourceNotFoundError({
          msg: 'User not found error.',
        }),
      );
    }

    const invoicing =
      await this.appointmentsRepository.fetchInvoicingByProfessionalId(
        professionalId,
        dateRange,
      );

    return right({ invoicing });
  }
}

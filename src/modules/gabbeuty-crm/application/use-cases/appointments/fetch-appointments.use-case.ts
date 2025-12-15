import { Either, left, right } from '@/_shared/either';
import { DateRange } from '@/_shared/entities/date-range';
import { PaginationParam } from '@/_shared/entities/pagination-param';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { UserRepository } from '@/_shared/repositories/user.repository';
import { AppointmentDetails } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-with-client.vo';
import { AppointmentsRepository } from '@/modules/gabbeuty-crm/domain/repositories/appointments.repository';
import { Injectable } from '@nestjs/common';

export interface FetchAppointmentUseCaseRequest {
  professionalId: string;
  pagination: PaginationParam;
  dateRange: DateRange;
}

type FetchAppointmentUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    appointments: AppointmentDetails[];
  }
>;

@Injectable()
export class FetchAppointmentUseCase {
  constructor(
    private professionalsRepository: UserRepository,
    private appointmentsRepository: AppointmentsRepository,
  ) {}

  async execute({
    professionalId,
    pagination,
    dateRange,
  }: FetchAppointmentUseCaseRequest): Promise<FetchAppointmentUseCaseResponse> {
    const isValidProfessional =
      await this.professionalsRepository.findById(professionalId);

    if (!isValidProfessional) {
      return left(
        new ResourceNotFoundError({ msg: 'Client not found error.' }),
      );
    }

    const appointments =
      await this.appointmentsRepository.fetchAppointmentsWithClientByProfessionalId(
        professionalId,
        pagination,
        dateRange,
      );

    return right({
      appointments,
    });
  }
}

import { Either, left, right } from '@/_shared/either';
import { DateRange } from '@/_shared/entities/date-range';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { UserRepository } from '@/_shared/repositories/user.repository';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';
import { AppointmentsRepository } from '@/modules/gabbeuty-crm/domain/repositories/appointments.repository';
import { Injectable } from '@nestjs/common';

export interface FetchCountAppointmentByStatusUseCaseRequest {
  professionalId: string;
  dateRange: DateRange;
  status: AppointmentStatus;
}

type FetchCountAppointmentByStatusUseResponse = Either<
  ResourceNotFoundError,
  {
    total: number;
  }
>;

@Injectable()
export class CountAppointmentByStatusUseUseCase {
  constructor(
    private userRepository: UserRepository,
    private appointmentsRepository: AppointmentsRepository,
  ) {}

  async execute({
    professionalId,
    dateRange,
    status,
  }: FetchCountAppointmentByStatusUseCaseRequest): Promise<FetchCountAppointmentByStatusUseResponse> {
    const isValidProfessional =
      await this.userRepository.findById(professionalId);

    if (!isValidProfessional) {
      return left(
        new ResourceNotFoundError({
          msg: 'User not found',
        }),
      );
    }

    const total =
      await this.appointmentsRepository.countAppointmentByStatusByPeriod(
        professionalId,
        status,
        dateRange,
      );

    return right({
      total,
    });
  }
}

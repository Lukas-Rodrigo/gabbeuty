import { Either, left, right } from '@/_shared/either';
import { DateRange } from '@/_shared/entities/date-range';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { UserRepository } from '@/_shared/repositories/user.repository';
import { AppointmentMetrics } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-metrics.vo';
import { AppointmentsRepository } from '@/modules/gabbeuty-crm/domain/repositories/appointments.repository';
import { Injectable } from '@nestjs/common';

export interface FetchAppointmentMetricsUseCaseRequest {
  professionalId: string;
  dateRange: DateRange;
}

export type FetchAppointmentMetricsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    metrics: AppointmentMetrics;
  }
>;

@Injectable()
export class FetchAppointmentMetricsUseCase {
  constructor(
    private userRepository: UserRepository,
    private appointmentsRepository: AppointmentsRepository,
  ) {}

  async execute({
    professionalId,
    dateRange,
  }: FetchAppointmentMetricsUseCaseRequest): Promise<FetchAppointmentMetricsUseCaseResponse> {
    // 1. Validar professional
    const isValidProfessional =
      await this.userRepository.findById(professionalId);

    if (!isValidProfessional) {
      return left(
        new ResourceNotFoundError({
          msg: 'User not found error',
        }),
      );
    }

    // 3. Buscar dados brutos do repositório
    const rawMetrics =
      await this.appointmentsRepository.fetchAppointmentsMetrics(
        professionalId,
        dateRange,
      );

    // 4. Criar Value Object com dados + dateRange
    const metrics = AppointmentMetrics.create({
      confirmed: rawMetrics.confirmed,
      pending: rawMetrics.pending,
      canceled: rawMetrics.canceled,
      completed: rawMetrics.completed,
      invoicing: rawMetrics.invoicing,
    });

    return right({
      metrics,
    });
  }
}

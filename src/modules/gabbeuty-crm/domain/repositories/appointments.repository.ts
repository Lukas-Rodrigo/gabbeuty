import { DateRange } from '@/_shared/entities/date-range';
import { Appointment } from '../entities/appointment.entity';
import { PaginationParam } from '@/_shared/entities/pagination-param';
import { AppointmentDetails } from '../entities/value-objects/appointment-with-client.vo';
import { AppointmentStatus } from '../entities/value-objects/appointment-status.vo';
import { AppointmentMetrics } from '../entities/value-objects/appointment-metrics.vo';

export abstract class AppointmentsRepository {
  // used
  abstract create(appointment: Appointment): Promise<void>;

  abstract save(appointmentId: string, appointment: Appointment): Promise<void>;

  abstract findById(appointmentId: string): Promise<Appointment | null>;

  abstract fetchInvoicingByProfessionalId(
    professionalId: string,
    dateRange: DateRange,
  ): Promise<number>;

  abstract fetchIAppointmentsByProfessionalId(
    professionalId: string,
    dateRange: DateRange,
  ): Promise<Appointment[]>;

  abstract fetchAppointmentByStatusByPeriod(
    professionalId: string,
    status: AppointmentStatus,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]>;

  // used
  abstract countAppointmentByStatusByPeriod(
    professionalId: string,
    status: AppointmentStatus,
    dateRange: DateRange,
  ): Promise<number>;

  // used
  abstract fetchAppointmentsMetrics(
    professionalId: string,
    dateRange: DateRange,
  ): Promise<AppointmentMetrics>;

  abstract fetchAppointmentsWithClientByProfessionalId(
    professionalId: string,
    pagination: PaginationParam,
    dateRange: DateRange,
  ): Promise<AppointmentDetails[]>;
}

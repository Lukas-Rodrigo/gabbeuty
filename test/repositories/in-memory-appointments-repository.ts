import { Appointment } from '@/modules/gabbeuty-crm/domain/entities/appointment.entity';
import { AppointmentDetails } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-with-client.vo';
import { AppointmentMetrics } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-metrics.vo';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';
import { AppointmentsRepository } from '@/modules/gabbeuty-crm/domain/repositories/appointments.repository';

export class InMemoryAppointmentsRepository implements AppointmentsRepository {
  public appointments: Appointment[] = [];

  async create(appointment: Appointment): Promise<void> {
    this.appointments.push(appointment);
  }

  async save(appointmentId: string, appointment: Appointment): Promise<void> {
    const index = this.appointments.findIndex(
      (appt) => appt.id.toValue() === appointmentId,
    );
    if (index !== -1) {
      this.appointments[index] = appointment;
    }
  }

  async findById(appointmentId: string): Promise<Appointment | null> {
    const appointment = this.appointments.find(
      (appt) => appt.id.toValue() === appointmentId,
    );
    return appointment || null;
  }

  async fetchInvoicingByProfessionalId(
    professionalId: string,
  ): Promise<number> {
    const filtered = this.appointments.filter(
      (appt) => appt.professionalId.toValue() === professionalId,
    );
    return filtered.reduce((sum, appt) => sum + appt.totalPrice, 0);
  }

  async fetchIAppointmentsByProfessionalId(
    professionalId: string,
  ): Promise<Appointment[]> {
    return this.appointments.filter(
      (appt) => appt.professionalId.toValue() === professionalId,
    );
  }

  async fetchAppointmentByStatusByPeriod(
    professionalId: string,
    status: AppointmentStatus,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    return this.appointments.filter(
      (appt) =>
        appt.professionalId.toValue() === professionalId &&
        appt.status === status &&
        appt.createdAt >= startDate &&
        appt.createdAt <= endDate,
    );
  }

  async countAppointmentByStatusByPeriod(
    professionalId: string,
    status: AppointmentStatus,
  ): Promise<number> {
    return this.appointments.filter(
      (appt) =>
        appt.professionalId.toValue() === professionalId &&
        appt.status === status,
    ).length;
  }

  async fetchAppointmentsMetrics(
    professionalId: string,
  ): Promise<AppointmentMetrics> {
    const filtered = this.appointments.filter(
      (appt) => appt.professionalId.toValue() === professionalId,
    );

    const confirmed = filtered.filter(
      (appt) => appt.status === AppointmentStatus.CONFIRMED,
    ).length;
    const pending = filtered.filter(
      (appt) => appt.status === AppointmentStatus.PENDING,
    ).length;
    const canceled = filtered.filter(
      (appt) => appt.status === AppointmentStatus.CANCELED,
    ).length;
    const completed = filtered.filter(
      (appt) => appt.status === AppointmentStatus.COMPLETED,
    ).length;
    const invoicing = filtered.reduce((sum, appt) => sum + appt.totalPrice, 0);

    return AppointmentMetrics.create({
      confirmed,
      pending,
      canceled,
      completed,
      invoicing,
    });
  }

  async fetchAppointmentsWithClientByProfessionalId(): Promise<
    AppointmentDetails[]
  > {
    // For in-memory testing, return empty array (full implementation needs database joins)
    return [] as AppointmentDetails[];
  }
}

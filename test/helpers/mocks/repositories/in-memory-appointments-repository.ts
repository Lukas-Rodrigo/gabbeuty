import { Appointment } from '@/modules/gabbeuty-crm/domain/entities/appointment.entity';
import { AppointmentDetailsView } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-details-view';
import { AppointmentMetrics } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-metrics.vo';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';
import { AppointmentsRepository } from '@/modules/gabbeuty-crm/domain/repositories/appointments.repository';
import { InMemoryClientsRepository } from './in-memory-clients-repository';
import { InMemoryBusinessServicesRepository } from './in-memory-business-services-repository';
import { BusinessService } from '@/modules/gabbeuty-crm/domain/entities/business-service.entity';

export class InMemoryAppointmentsRepository implements AppointmentsRepository {
  public appointments: Appointment[] = [];

  constructor(
    private clientsRepository?: InMemoryClientsRepository,
    private businessServicesRepository?: InMemoryBusinessServicesRepository,
  ) {}

  async create(appointment: Appointment): Promise<AppointmentDetailsView> {
    this.appointments.push(appointment);
    return this.buildAppointmentDetailsView(appointment);
  }

  async save(
    appointmentId: string,
    appointment: Appointment,
  ): Promise<AppointmentDetailsView> {
    const index = this.appointments.findIndex(
      (appt) => appt.id.toValue() === appointmentId,
    );
    if (index !== -1) {
      this.appointments[index] = appointment;
    }
    return this.buildAppointmentDetailsView(appointment);
  }

  private async buildAppointmentDetailsView(
    appointment: Appointment,
  ): Promise<AppointmentDetailsView> {
    const client = this.clientsRepository
      ? await this.clientsRepository.findById(appointment.clientId.toValue())
      : null;

    const serviceIds = appointment.services
      .getItems()
      .map((s) => s.serviceId.toValue());
    const services: BusinessService[] = [];

    if (this.businessServicesRepository && serviceIds.length > 0) {
      for (const serviceId of serviceIds) {
        const service =
          await this.businessServicesRepository.findById(serviceId);
        if (service) {
          services.push(service);
        }
      }
    }

    return AppointmentDetailsView.create({
      appointment,
      client: client!,
      services,
    });
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

  async fetchAppointmentsWithClientByProfessionalId(
    professionalId: string,
  ): Promise<AppointmentDetailsView[]> {
    const appointments = this.appointments.filter(
      (appt) => appt.professionalId.toValue() === professionalId,
    );

    const appointmentDetailsViews: AppointmentDetailsView[] = [];

    for (const appointment of appointments) {
      const detailsView = await this.buildAppointmentDetailsView(appointment);
      appointmentDetailsViews.push(detailsView);
    }

    return appointmentDetailsViews;
  }
}

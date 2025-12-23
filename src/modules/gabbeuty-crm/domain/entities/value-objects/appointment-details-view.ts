import { Appointment } from '../appointment.entity';
import { BusinessService } from '../business-service.entity';
import { Client } from '../client.entity';

/**
 * Appointment Details (Read Model / DTO)
 *
 * This is NOT a traditional Value Object, but a READ MODEL (Query side).
 * Used for fetching complete appointment information with related entities.
 *
 * Purpose:
 * - Optimize read operations (avoid multiple queries)
 * - Provide rich view data for UI
 * - Encapsulate appointment display logic
 *
 * Pattern: Read Model (CQRS pattern)
 * Note: This is a Query-side projection, not a domain Value Object
 */
export interface AppointmentDetailsViewProps {
  appointment: Appointment;
  client: Client;
  services: BusinessService[];
}

export class AppointmentDetailsView {
  private constructor(private props: AppointmentDetailsViewProps) {}

  static create(props: AppointmentDetailsViewProps): AppointmentDetailsView {
    return new AppointmentDetailsView(props);
  }

  get appointment(): Appointment {
    return this.props.appointment;
  }

  get client(): Client {
    return this.props.client;
  }

  get services(): BusinessService[] {
    return this.props.services;
  }

  // Business Methods (Display Logic)

  getTotalPrice(): number {
    return this.props.services.reduce((total, service) => {
      return total + service.price;
    }, 0);
  }

  getTotalDuration(): number {
    return this.props.services.reduce((total, service) => {
      return total + service.duration;
    }, 0);
  }

  getServicesNames(): string {
    return this.props.services.map((s) => s.name).join(', ');
  }

  canBeCancelled(): boolean {
    const now = new Date();
    const appointmentDate = this.props.appointment.date;
    const hoursDifference =
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursDifference > 24;
  }

  isUpcoming(): boolean {
    const now = new Date();
    return this.props.appointment.date > now;
  }

  isPast(): boolean {
    const now = new Date();
    return this.props.appointment.date < now;
  }
}

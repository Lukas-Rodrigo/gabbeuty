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
export interface AppointmentDetailsProps {
  appointment: Appointment;
  client: Client;
  services: BusinessService[];
}

export class AppointmentDetails {
  private constructor(private props: AppointmentDetailsProps) {}

  static create(props: AppointmentDetailsProps): AppointmentDetails {
    return new AppointmentDetails(props);
  }

  // ==========================================
  // Entity Getters
  // ==========================================

  get appointment(): Appointment {
    return this.props.appointment;
  }

  get client(): Client {
    return this.props.client;
  }

  get services(): BusinessService[] {
    return this.props.services;
  }

  // ==========================================
  // Convenience Getters (Derived Data)
  // ==========================================

  get appointmentId(): string {
    return this.props.appointment.id.toValue();
  }

  get clientId(): string {
    return this.props.client.id.toValue();
  }

  get clientName(): string {
    return this.props.client.name;
  }

  get clientPhone(): string {
    return this.props.client.phoneNumber;
  }

  get appointmentDate(): Date {
    return this.props.appointment.date;
  }

  get appointmentTitle(): string {
    return this.props.appointment.title;
  }

  get status(): string {
    return this.props.appointment.status.toString();
  }

  get professionalId(): string {
    return this.props.appointment.professionalId.toValue();
  }

  // ==========================================
  // Business Methods (Display Logic)
  // ==========================================

  /**
   * Calculate total price from all services
   */
  getTotalPrice(): number {
    return this.props.services.reduce((total, service) => {
      return total + service.price;
    }, 0);
  }

  /**
   * Calculate total duration from all services
   */
  getTotalDuration(): number {
    return this.props.services.reduce((total, service) => {
      return total + service.duration;
    }, 0);
  }

  /**
   * Get formatted date string
   */
  getFormattedDate(): string {
    return this.props.appointment.date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Get service names as comma-separated string
   */
  getServicesNames(): string {
    return this.props.services.map((s) => s.name).join(', ');
  }

  /**
   * Check if appointment can be cancelled
   */
  canBeCancelled(): boolean {
    const now = new Date();
    const appointmentDate = this.props.appointment.date;
    const hoursDifference =
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Can cancel if more than 24 hours before appointment
    return hoursDifference > 24;
  }

  /**
   * Check if appointment is upcoming
   */
  isUpcoming(): boolean {
    const now = new Date();
    return this.props.appointment.date > now;
  }

  /**
   * Check if appointment is past
   */
  isPast(): boolean {
    const now = new Date();
    return this.props.appointment.date < now;
  }

  // ==========================================
  // Serialization (for API responses)
  // ==========================================

  /**
   * Convert to plain object for API responses
   */
  toJSON() {
    return {
      id: this.appointmentId,
      title: this.appointmentTitle,
      date: this.appointmentDate,
      formattedDate: this.getFormattedDate(),
      status: this.status,
      client: {
        id: this.clientId,
        name: this.clientName,
        phone: this.clientPhone,
      },
      services: this.services.map((service) => ({
        id: service.id.toValue(),
        name: service.name,
        price: service.price,
        duration: service.duration,
      })),
      totalPrice: this.getTotalPrice(),
      totalDuration: this.getTotalDuration(),
      canBeCancelled: this.canBeCancelled(),
      isUpcoming: this.isUpcoming(),
    };
  }
}

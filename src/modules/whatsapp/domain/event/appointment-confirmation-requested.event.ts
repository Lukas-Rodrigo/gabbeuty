import { DomainEvent } from '@/_shared/event/domain-event';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';

/**
 * Appointment Confirmation Requested Event
 *
 * Fired when a client confirms an appointment via WhatsApp button.
 *
 * Pattern: Domain Event
 * Layer: Domain Layer (WhatsApp Module)
 *
 * Flow:
 * 1. WhatsApp receives button click
 * 2. WhatsApp emits this event
 * 3. CRM module listens and handles confirmation
 *
 * Benefits:
 * - WhatsApp module doesn't know about CRM
 * - Loose coupling between modules
 * - Easy to test
 * - Follows Dependency Inversion
 */
export class AppointmentConfirmationRequestedEvent implements DomainEvent {
  public occurredAt: Date;

  constructor(
    public appointmentId: string,
    public clientPhoneNumber: string,
    public professionalId: string,
  ) {
    this.occurredAt = new Date();
  }

  getAggregateId(): UniqueEntityID {
    return new UniqueEntityID(this.appointmentId);
  }
}

import { DomainEvent } from '@/_shared/event/domain-event';
import { AppointmentStatus } from '../entities/value-objects/appointment-status.vo';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';

export interface AppointmentConfirmedEventPayload {
  appointmentId: string;
  userId: string;
  clientId: string;
  clientName?: string;
  clientPhoneNumber: string;
  date: Date;
  status: AppointmentStatus;
  title: string;
}

export class AppointmentConfirmedEvent implements DomainEvent {
  public occurredAt: Date;

  constructor(public readonly payload: AppointmentConfirmedEventPayload) {
    this.occurredAt = new Date();
  }

  getAggregateId(): UniqueEntityID {
    return new UniqueEntityID(this.payload.appointmentId);
  }
}

import { DomainEvent } from '@/_shared/event/domain-event';
import { UniqueEntityID } from '@/_shared/value-objects/unique-entity-id.vo';
import { AppointmentStatus } from '../entities/value-objects/appointment-status.vo';

export interface AppointmentCreatedPayload {
  appointmentId: string;
  userId: string;
  clientId: string;
  clientName?: string;
  clientPhoneNumber: string;
  date: Date;
  status: AppointmentStatus;
  title: string;
}

export class AppointmentCreatedEvent implements DomainEvent {
  public occurredAt: Date;

  constructor(public readonly payload: AppointmentCreatedPayload) {
    this.occurredAt = new Date();
  }

  getAggregateId(): UniqueEntityID {
    return new UniqueEntityID(this.payload.appointmentId);
  }
}

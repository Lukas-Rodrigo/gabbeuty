import { UniqueEntityID } from '../entities/value-objects/unique-entity-id.vo';

export interface DomainEvent {
  occurredAt: Date;
  getAggregateId(): UniqueEntityID;
}

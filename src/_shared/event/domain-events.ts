import { UniqueEntityID } from '../entities/value-objects/unique-entity-id.vo';
import { AggregateRoot } from './aggregate-root';
import { DomainEvent } from './domain-event';
import { EventHandler } from './event-handler';

type EventHandlerMap = Map<string, EventHandler[]>;

export class DomainEvents {
  public static handlers: EventHandlerMap = new Map();
  private static markedAggregates: AggregateRoot<unknown>[] = [];

  public static register(eventClassName: string, handler: EventHandler): void {
    if (!this.handlers.has(eventClassName)) {
      this.handlers.set(eventClassName, []);
    }
    this.handlers.get(eventClassName)!.push(handler);
  }

  public static markAggregateForDispatch(
    aggregate: AggregateRoot<unknown>,
  ): void {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }

  private static dispatchAggregateEvents(
    aggregate: AggregateRoot<unknown>,
  ): void {
    aggregate.domainEvents.forEach((event: DomainEvent) =>
      this.dispatch(event),
    );
  }

  private static removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<unknown>,
  ): void {
    const index = this.markedAggregates.findIndex(
      (a) => a.id.toValue() === aggregate.id.toValue(),
    );

    if (index !== -1) {
      this.markedAggregates.splice(index, 1);
    }
  }

  private static findMarkedAggregateByID(
    id: UniqueEntityID,
  ): AggregateRoot<unknown> | undefined {
    return this.markedAggregates.find(
      (aggregate) => aggregate.id.toValue() === id.toValue(),
    );
  }

  public static dispatchEventsForAggregate(id: UniqueEntityID): void {
    const aggregate = this.findMarkedAggregateByID(id);

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate);
      aggregate.clearEvents();
      this.removeAggregateFromMarkedDispatchList(aggregate);
    }
  }

  private static dispatch(event: DomainEvent): void {
    const eventClassName = event.constructor.name;
    const handlers = this.handlers.get(eventClassName);

    if (handlers) {
      handlers.forEach((handler) => {
        handler.handle(event).catch((error) => {
          console.error(`Error handling ${eventClassName}:`, error);
        });
      });
    }
  }

  // only tests
  public static clearHandlers(): void {
    this.handlers.clear();
  }

  public static clearMarkedAggregates(): void {
    this.markedAggregates = [];
  }
}

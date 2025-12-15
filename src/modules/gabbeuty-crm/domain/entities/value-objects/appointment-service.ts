import { Entity } from '@/_shared/entities/base-entity.entity';
import { Optional } from '@/_shared/types/optinal';
import { UniqueEntityID } from '@/_shared/value-objects/unique-entity-id.vo';

export interface AppointmentServiceProps {
  serviceId: UniqueEntityID;
  serviceName: string;
  price: number;
  duration: number;
  order: number;
  createdAt: Date;
}

export class AppointmentService extends Entity<AppointmentServiceProps> {
  static create(
    props: Optional<AppointmentServiceProps, 'createdAt'>,
    id?: string,
  ): AppointmentService {
    const appointmentService = new AppointmentService(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return appointmentService;
  }

  get serviceId() {
    return this.props.serviceId;
  }

  get serviceName() {
    return this.props.serviceName;
  }

  get price() {
    return this.props.price;
  }

  get duration() {
    return this.props.duration;
  }

  get order() {
    return this.props.order;
  }

  updateOrder(newOrder: number): void {
    this.props.order = newOrder;
  }

  getFormattedPrice(): string {
    return `R$ ${this.price.toFixed(2)}`;
  }

  getFormattedDuration(): string {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;

    if (hours === 0) {
      return `${minutes}min`;
    }
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h${minutes}min`;
  }
}

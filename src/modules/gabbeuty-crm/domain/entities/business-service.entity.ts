import { left } from '@/_shared/either';
import { Entity } from '@/_shared/entities/base-entity.entity';
import { Optional } from '@/_shared/types/optinal';
import { UniqueEntityID } from '@/_shared/value-objects/unique-entity-id.vo';

export interface BusinessServiceProps {
  name: string;
  price: number;
  duration: number;
  createdAt: Date;
  deletedAt?: Date;
  professionalId: UniqueEntityID;
}
export class BusinessService extends Entity<BusinessServiceProps> {
  static create(
    props: Optional<BusinessServiceProps, 'createdAt'>,
    id?: string,
  ) {
    return new BusinessService(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }

  get name() {
    return this.props.name;
  }

  get price() {
    return this.props.price;
  }

  get duration() {
    return this.props.duration;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get professionalId() {
    return this.props.professionalId;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  delete() {
    if (this.deletedAt) {
      return left(Error());
    }
    this.props.deletedAt = new Date();
  }

  updateName(name: string) {
    this.props.name = name;
  }

  updatePrice(price: number) {
    this.props.price = price;
  }
}

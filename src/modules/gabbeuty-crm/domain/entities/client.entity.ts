import { left } from '@/_shared/either';
import { Entity } from '@/_shared/entities/base-entity.entity';
import { Optional } from '@/_shared/types/optinal';
import { UniqueEntityID } from '@/_shared/value-objects/unique-entity-id.vo';

export interface ClientProps {
  name: string;
  createdAt: Date;
  deletedAt?: Date;
  phoneNumber: string;
  profileUrl?: string | null;
  observation?: string | null;
  professionalId: UniqueEntityID;
}

export class Client extends Entity<ClientProps> {
  static create(props: Optional<ClientProps, 'createdAt'>, id?: string) {
    return new Client(
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

  get createdAt() {
    return this.props.createdAt;
  }

  get phoneNumber() {
    return this.props.phoneNumber;
  }

  get profileUrl(): string | null | undefined {
    return this.props.profileUrl;
  }

  get observation(): string | null | undefined {
    return this.props.observation;
  }

  get professionalId() {
    return this.props.professionalId;
  }
  get deletedAt() {
    return this.props.deletedAt;
  }

  updateName(name: string) {
    if (name.length < 3) {
      return left(Error('....'));
    }
    this.props.name = name;
  }

  set phoneNumber(phoneNumber: string) {
    this.props.phoneNumber = phoneNumber;
  }

  set profileUrl(profileUrl: string) {
    this.props.profileUrl = profileUrl;
  }

  set observation(observation: string) {
    this.props.observation = observation;
  }
}

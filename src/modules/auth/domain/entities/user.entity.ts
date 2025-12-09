import { Entity } from '@/_shared/entities/base-entity.entity';
import { Optional } from '@/_shared/types/optinal';

export interface UserProps {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export class User extends Entity<UserProps> {
  static create(props: Optional<UserProps, 'createdAt'>, id?: string) {
    return new User(
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
  get email() {
    return this.props.email;
  }
  get password() {
    return this.props.password;
  }
  get createdAt() {
    return this.props.createdAt;
  }
}

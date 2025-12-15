import { Entity } from '@/_shared/entities/base-entity.entity';

export interface ProfessionalProps {
  name: string;
  email: string;
  password: string;
}

export class Professional extends Entity<ProfessionalProps> {
  static create(props: ProfessionalProps, id?: string) {
    return new Professional(
      {
        ...props,
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
}

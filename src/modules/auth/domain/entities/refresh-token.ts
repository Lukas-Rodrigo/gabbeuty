import { Entity } from '@/_shared/entities/base-entity.entity';

export interface RefreshTokenProps {
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export class RefreshToken extends Entity<RefreshTokenProps> {
  static create(props: RefreshTokenProps, id?: string) {
    return new RefreshToken(
      {
        ...props,
      },
      id,
    );
  }

  get userId() {
    return this.props.userId;
  }

  get token() {
    return this.props.token;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }
}

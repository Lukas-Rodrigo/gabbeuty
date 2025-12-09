import { UseCaseError } from './use-case-error.interface';

export class TokenExpiredError extends Error implements UseCaseError {
  constructor() {
    super('Token expired, please reconnect');
  }
}

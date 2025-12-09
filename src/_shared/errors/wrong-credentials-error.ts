import { UseCaseError } from './use-case-error.interface';

export class WrongCredentialsError extends Error implements UseCaseError {
  constructor() {
    super('Wrong credentials');
  }
}

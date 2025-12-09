import { UseCaseError } from './use-case-error.interface';

export class InvalidDateError extends Error implements UseCaseError {
  constructor() {
    super('It is not possible to create a appointments in the past.');
  }
}

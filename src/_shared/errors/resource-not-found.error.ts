import { UseCaseError } from './use-case-error.interface';

export class ResourceNotFoundError extends Error implements UseCaseError {
  constructor({ msg }: { msg: string }) {
    super(msg);
  }
}

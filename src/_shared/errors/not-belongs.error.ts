import { UseCaseError } from './use-case-error.interface';

export class NotBelongsError extends Error implements UseCaseError {
  constructor({ msg }: { msg: string }) {
    super(msg);
  }
}

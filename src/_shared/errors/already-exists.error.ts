import { UseCaseError } from './use-case-error.interface';

export class AlreadyExists extends Error implements UseCaseError {
  constructor({ msg }: { msg: string }) {
    super(msg);
  }
}

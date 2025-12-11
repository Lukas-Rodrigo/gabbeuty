import { QueueJobOptions } from './queue-manager';

export class QueueJobData<T> {
  constructor(
    public readonly name: string,
    public readonly data: T,
    public readonly options?: QueueJobOptions,
  ) {}

  static create<T>(
    name: string,
    data: T,
    options?: QueueJobOptions,
  ): QueueJobData<T> {
    return new QueueJobData(name, data, options);
  }
}

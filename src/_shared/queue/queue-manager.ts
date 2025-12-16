export interface QueueJobOptions {
  jobId?: string;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  delay?: number;
  priority?: number;
  timeout?: number;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean;
}

export interface QueueJob<T = any> {
  id: string;
  name: string;
  data: T;
  attemptsMade: number;
  failedReason?: string;
  timestamp: Date;
}

export abstract class QueueProvider {
  abstract add<T>(
    queueName: 'calendar-sync' | 'notification',
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<string>;

  abstract getFailedJobs<T>(): Promise<QueueJob<T>[]>;

  abstract retryJob(jobId: string): Promise<void>;

  abstract removeJob(jobId: string): Promise<void>;

  abstract getJob<T>(jobId: string): Promise<QueueJob<T> | null>;
}

import { Injectable } from '@nestjs/common';
import bull from 'bull';
import { InjectQueue } from '@nestjs/bull';
import {
  QueueJob,
  QueueJobOptions,
  QueueProvider,
} from '@/_shared/queue/queue-manager';

@Injectable()
export class BullQueueManager extends QueueProvider {
  private queues: Map<string, bull.Queue>;

  constructor(
    @InjectQueue('calendar-sync')
    private readonly calendarSyncQueue: bull.Queue,

    @InjectQueue('notification')
    private readonly notificationQueue: bull.Queue,
  ) {
    super();

    this.queues = new Map([
      ['calendar-sync', this.calendarSyncQueue],
      ['notification', this.notificationQueue],
    ]);
  }

  async add<T>(
    queueName: 'calendar-sync' | 'notification',
    jobName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<string> {
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    const job = await queue.add(jobName, data, options);
    return job.id.toString();
  }

  async getFailedJobs<T>(): Promise<QueueJob<T>[]> {
    const failedJobs = await this.calendarSyncQueue.getFailed();
    return failedJobs.map((job) => this.mapBullJobToQueueJob<T>(job));
  }

  async retryJob(jobId: string): Promise<void> {
    const job = await this.calendarSyncQueue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    await job.retry();
  }

  async removeJob(jobId: string): Promise<void> {
    const job = await this.calendarSyncQueue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    await job.remove();
  }

  async getJob<T>(jobId: string): Promise<QueueJob<T> | null> {
    const job = await this.calendarSyncQueue.getJob(jobId);
    if (!job) {
      return null;
    }
    return this.mapBullJobToQueueJob<T>(job);
  }

  private mapBullJobToQueueJob<T>(bullJob: bull.Job): QueueJob<T> {
    return {
      id: bullJob.id.toString(),
      name: bullJob.name,
      data: bullJob.data as T,
      attemptsMade: bullJob.attemptsMade,
      failedReason: bullJob.failedReason,
      timestamp: new Date(bullJob.timestamp),
    };
  }
}

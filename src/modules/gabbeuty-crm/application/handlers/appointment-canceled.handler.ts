import { EventHandler } from '@/_shared/event/event-handler';
import { Injectable, Logger } from '@nestjs/common';
import { QueueProvider } from '@/_shared/queue/queue-manager';
import { AppointmentCanceledEvent } from '../../domain/events/appointment-canceled.event';

@Injectable()
export class AppointmentCanceledHandler implements EventHandler {
  private logger = new Logger(AppointmentCanceledHandler.name);

  constructor(private queueProvider: QueueProvider) {}

  async handle(event: AppointmentCanceledEvent): Promise<void> {
    const { payload } = event;

    const { appointmentId } = payload;

    this.logger.log(`Processing cancellation for appointment ${appointmentId}`);

    const jobId = `appointment:${appointmentId}:reminder`;

    const job = await this.queueProvider.getJob(jobId);

    if (job) {
      await this.queueProvider.removeJob(jobId);
      this.logger.log(
        `Appointment reminder removed successfully ✅ (jobId: ${jobId})`,
      );
    } else {
      this.logger.warn(
        `Reminder job not found for appointment ${appointmentId} (may have already been sent or removed)`,
      );
    }
  }
}

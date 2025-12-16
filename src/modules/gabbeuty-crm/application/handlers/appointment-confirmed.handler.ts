import { EventHandler } from '@/_shared/event/event-handler';
import { Injectable, Logger } from '@nestjs/common';
import { AppointmentConfirmedEvent } from '../../domain/events/appointment-confirmed.event';
import { QueueProvider } from '@/_shared/queue/queue-manager';
import { ReminderTemplate } from '@/_shared/templates/reminder-template.vo';

@Injectable()
export class AppointmentConfirmedHandler implements EventHandler {
  private logger = new Logger(AppointmentConfirmedHandler.name);

  constructor(private queueProvider: QueueProvider) {}

  async handle(event: AppointmentConfirmedEvent): Promise<void> {
    const { payload } = event;

    const {
      appointmentId,
      clientId,
      clientPhoneNumber,
      clientName,
      date,
      status,
      title,
      userId,
    } = payload;

    this.logger.log('Executing reminder appointment handler');

    const delay = this.calculateReminderDelay(date, 30);

    if (!delay) {
      return;
    }

    const messageReminder = ReminderTemplate.thirtyMinutesBefore({
      date,
      clientName: clientName ?? '',
      appointmentTitle: title,
    });

    await this.queueProvider.add(
      'notification',
      'whatsapp-notification',
      {
        message: messageReminder,
        userId,
        phoneNumber: clientPhoneNumber,
        reference: {
          id: appointmentId,
        },
      },
      {
        jobId: `appointment:${appointmentId}:reminder`,
        delay,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
    this.logger.log('Reminder of notification success ✅');
  }

  private calculateReminderDelay(
    appointmentDate: Date,
    minutesBefore: 5 | 10 | 30,
  ): number | null {
    const now = Date.now();

    const MINUTE_IN_MS = 60 * 1000;
    const reminderTime =
      appointmentDate.getTime() - minutesBefore * MINUTE_IN_MS;

    const delay = reminderTime - now;

    if (delay <= 0) {
      return null;
    }

    return delay;
  }
}

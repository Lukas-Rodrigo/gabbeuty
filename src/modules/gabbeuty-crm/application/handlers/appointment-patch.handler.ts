import { EventHandler } from '@/_shared/event/event-handler';
import { Injectable, Logger } from '@nestjs/common';
import { QueueProvider } from '@/_shared/queue/queue-manager';
import { AppointmentTemplate } from '@/_shared/templates/appointment-template.vo';
import { AppointmentPatchEvent } from '../../domain/events/appointment-patch.event';

@Injectable()
export class AppointmentPatchHandler implements EventHandler {
  private logger = new Logger(AppointmentPatchHandler.name);

  constructor(private queueProvider: QueueProvider) {}

  async handle(event: AppointmentPatchEvent): Promise<void> {
    this.logger.log('👐 Event in handler about new appointment');

    const { payload } = event;
    const {
      appointmentId,
      clientId,
      clientPhoneNumber,
      date,
      status,
      title,
      userId,
      clientName,
    } = payload;

    const messageNotification = AppointmentTemplate.getByStatus({
      date,
      status,
      title,
      clientName,
    });

    await this.queueProvider.add('notification', 'whatsapp-notification', {
      message: messageNotification,
      userId,
      phoneNumber: clientPhoneNumber,
      reference: {
        id: appointmentId,
      },
    });

    this.logger.log('Confirmation of notification success ✅');
  }
}

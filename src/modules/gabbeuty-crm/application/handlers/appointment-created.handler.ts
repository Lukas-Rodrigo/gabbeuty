import { EventHandler } from '@/_shared/event/event-handler';
import { Injectable, Logger } from '@nestjs/common';
import { AppointmentCreatedEvent } from '../../domain/events/appointment-created.event';
import { QueueProvider } from '@/_shared/queue/queue-manager';
import { AppointmentTemplate } from '@/_shared/templates/appointment-template.vo';

@Injectable()
export class AppointmentCreatedHandler implements EventHandler {
  private logger = new Logger(AppointmentCreatedHandler.name);

  constructor(private queueProvider: QueueProvider) {}

  async handle(event: AppointmentCreatedEvent): Promise<void> {
    this.logger.log('Event in handler about new appointment', event);

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

    const messageNotification = AppointmentTemplate.pending({
      date,
      status,
      title,
      clientName,
    });

    await this.queueProvider.add('notification', 'whatsapp-confirmation', {
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

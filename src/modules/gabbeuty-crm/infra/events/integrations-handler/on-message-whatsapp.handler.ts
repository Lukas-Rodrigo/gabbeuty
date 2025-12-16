import { PatchAppointmentUseCase } from '@/modules/gabbeuty-crm/application/use-cases/appointments/patch-appointment.use-case';
import { WhatsAppMessageEvent } from '@/modules/whatsapp/domain/event/whatsapp-message.event';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class OnMessageWhatsappHandler {
  private logger = new Logger(OnMessageWhatsappHandler.name);

  constructor(private patchAppointmentUseCase: PatchAppointmentUseCase) {}

  @OnEvent('whatsapp.message')
  async handle(event: WhatsAppMessageEvent) {
    this.logger.log(`Evento de mensagem recebido:`, event);

    if (event.confirm.appointmentId && event.confirm.buttonMessage) {
      return await this.handleStatusAppointment({
        appointmentId: event.confirm.appointmentId,
        userId: event.userId,
        buttonMessage: event.confirm.buttonMessage,
      });
    }
  }

  private async handleStatusAppointment(event: {
    userId: string;
    appointmentId: string;
    buttonMessage: string;
  }) {
    const action = event.buttonMessage.toLowerCase();
    this.logger.log('Handle function event: ', event);

    switch (action) {
      case 'confirmar':
        await this.patchAppointmentUseCase.execute({
          appointmentId: event.appointmentId,
          professionalId: event.userId,
          status: AppointmentStatus.CONFIRMED,
        });
        break;
      case 'cancelar':
        await this.patchAppointmentUseCase.execute({
          appointmentId: event.appointmentId,
          professionalId: event.userId,
          status: AppointmentStatus.CANCELED,
        });
        break;
    }
  }
}

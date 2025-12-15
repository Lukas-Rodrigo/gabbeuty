import { SendWhatsappMessageUseCase } from '@/modules/whatsapp/application/use-cases/send-whatsapp-message.use-case';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

import bull from 'bull';

interface WhatsAppNotificationJobData {
  message: string;
  userId: string;
  phoneNumber: string;
  reference: {
    id: string;
  };
}

@Processor('notification')
export class NotificationSyncProcessor {
  private readonly logger = new Logger(NotificationSyncProcessor.name);

  constructor(private sendMessageUseCase: SendWhatsappMessageUseCase) {}

  @Process('whatsapp-confirmation')
  async sendConfirmationMessage(
    job: bull.Job<WhatsAppNotificationJobData>,
  ): Promise<void> {
    const { message, userId, phoneNumber, reference } = job.data;
    const result = await this.sendMessageUseCase.execute({
      message: {
        text: message,
        buttons: [
          {
            buttonId: reference.id,
            buttonText: {
              displayText: 'Confirmar',
            },
            type: 1,
          },
          {
            buttonId: reference.id,
            buttonText: {
              displayText: 'Cancelar',
            },
            type: 1,
          },
        ],
      },
      phoneNumber,
      userId,
    });

    if (result.isLeft()) {
      this.logger.error(`❌ Erro ao enviar WhatsApp: ${result.value.message}`);
      throw result.value;
    }

    this.logger.log('✅ Mensagem enviada com sucesso!');
  }

  @Process('whatsapp-notification')
  async sendNotification(
    job: bull.Job<WhatsAppNotificationJobData>,
  ): Promise<void> {
    const { message, userId, phoneNumber } = job.data;
    const result = await this.sendMessageUseCase.execute({
      message: {
        text: message,
      },
      phoneNumber,
      userId,
    });

    if (result.isLeft()) {
      this.logger.error(`❌ Erro ao enviar WhatsApp: ${result.value.message}`);
      throw result.value;
    }

    this.logger.log('✅ Mensagem enviada com sucesso!');
  }
}

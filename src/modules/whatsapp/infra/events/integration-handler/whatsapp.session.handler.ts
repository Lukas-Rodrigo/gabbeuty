import { HandleWhatsappSessionUseCase } from '@/modules/whatsapp/application/use-cases/handle-whatsapp-session.use-case';
import { SessionStatus } from '@/modules/whatsapp/domain/entities/whatsapp-session.entity';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class WhatsAppSessionHandle {
  private readonly logger = new Logger(WhatsAppSessionHandle.name);

  constructor(
    private handleWhatsappSessionUseCase: HandleWhatsappSessionUseCase,
  ) {}

  @OnEvent('whatsapp.update')
  async handle(event: { userId: string; status: SessionStatus }) {
    this.logger.log('evento de session update', event);
    this.logger.debug('User id para event:', event.userId);
    this.logger.debug('status for event:', event.status);

    await this.handleWhatsappSessionUseCase.execute({
      status: event.status,
      userId: event.userId,
    });
  }
}

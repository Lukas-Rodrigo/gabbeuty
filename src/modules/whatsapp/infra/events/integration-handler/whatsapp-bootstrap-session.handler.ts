import { SessionBootstrapUseCase } from '@/modules/whatsapp/application/use-cases/session-bootstrap.use-case';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class WhatsappBootstrapSessionHandler {
  private readonly logger = new Logger(WhatsappBootstrapSessionHandler.name);

  constructor(private sessionBootstrapUseCase: SessionBootstrapUseCase) {}

  @OnEvent('whatsapp.session.hydration')
  async handle() {
    this.logger.log("🔄 Event 'whatsapp.session.hydration' received");

    await this.sessionBootstrapUseCase.execute();
    this.logger.log('✅ Session hydration completed');
  }
}

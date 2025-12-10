import { Either, right } from '@/_shared/either';
import { Injectable, Logger } from '@nestjs/common';
import { WhatsappNotificationProvider } from '../providers/whatsapp-notification.provider';
import { WhatsAppSessionRepository } from '../../domain/repositories/whatsapp-session.repository';

type SendMessageOutput = Either<Error, null>;

@Injectable()
export class SessionBootstrapUseCase {
  private readonly logger = new Logger(SessionBootstrapUseCase.name);

  constructor(
    private readonly whatsappProvider: WhatsappNotificationProvider,
    private readonly sessionRepository: WhatsAppSessionRepository,
  ) {}

  async execute(): Promise<SendMessageOutput> {
    const sessions = await this.sessionRepository.findAll();

    this.logger.log('Hydration sessions in memory');

    sessions.forEach(async (session) => {
      if (session.isConnected) {
        await this.whatsappProvider.connect(session);
      }
    });

    return right(null);
  }
}

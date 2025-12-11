import { Either, right } from '@/_shared/either';
import { Injectable, Logger } from '@nestjs/common';
import { SessionEventListener } from '../providers/session-event-listener.provider';
import { WhatsappNotificationProvider } from '../providers/whatsapp-notification.provider';
import { WhatsAppSessionRepository } from '../../domain/repositories/whatsapp-session.repository';
import {
  WhatsAppSessionEntity,
  SessionStatus,
} from '../../domain/entities/whatsapp-session.entity';

interface CreateSessionInput {
  userId: string;
}

type CreateSessionOutput = Either<
  Error,
  {
    sessionId: string;
    userId: string;
    qrCode?: string;
    connection: boolean | undefined;
  }
>;

@Injectable()
export class CreateWhatsAppSessionUseCase {
  private readonly logger = new Logger(CreateWhatsAppSessionUseCase.name);

  constructor(
    private readonly whatsappProvider: WhatsappNotificationProvider,
    private readonly waitConnectEvent: SessionEventListener,
    private readonly sessionRepository: WhatsAppSessionRepository,
  ) {}

  async execute(input: CreateSessionInput): Promise<CreateSessionOutput> {
    const { userId } = input;

    this.logger.log(`📱 Creating WhatsApp session for user: ${userId}`);

    const existingSession = await this.sessionRepository.findByUserId(userId);

    if (existingSession) {
      this.logger.warn(`Session already exists for user: ${userId}`);

      if (existingSession.isConnected) {
        return right({
          sessionId: existingSession.id.toValue(),
          userId: existingSession.userId,
          connection: true,
        });
      }
    }
    const session = WhatsAppSessionEntity.create({
      userId,
      status: SessionStatus.DISCONNECTED,
      retryCount: 0,
      maxRetries: 3,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.logger.log(`Session created with ID: ${session.id.toValue()}`);

    await this.whatsappProvider.connect(session);

    const event = await this.waitConnectEvent.waitForEvent('qr', userId);

    this.logger.log('Event :', {
      event,
    });

    return right({
      sessionId: session.id.toValue(),
      connection: event.connected,
      userId: session.userId,
      qrCode: event.qrCode,
    });
  }
}

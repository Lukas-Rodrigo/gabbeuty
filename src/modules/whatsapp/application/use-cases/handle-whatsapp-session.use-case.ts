import { Either, right } from '@/_shared/either';
import {
  SessionStatus,
  WhatsAppSessionEntity,
} from '../../domain/entities/whatsapp-session.entity';
import { Injectable, Logger } from '@nestjs/common';
import { WhatsAppSessionRepository } from '../../domain/repositories/whatsapp-session.repository';

interface HandleWhatsappSessionInput {
  userId: string;
  status: SessionStatus;
}

type HandleWhatsappSessionOuput = Either<Error, null>;

@Injectable()
export class HandleWhatsappSessionUseCase {
  private readonly logger = new Logger(HandleWhatsappSessionUseCase.name);

  constructor(private readonly sessionRepository: WhatsAppSessionRepository) {}

  async execute(
    input: HandleWhatsappSessionInput,
  ): Promise<HandleWhatsappSessionOuput> {
    const { userId, status } = input;
    const sessionExists = await this.sessionRepository.findByUserId(userId);

    if (!sessionExists) {
      this.logger.log(
        `Creating new session for user ${userId} with status ${status}`,
      );

      const newSession = WhatsAppSessionEntity.create({
        userId,
        status,
        retryCount: 0,
        maxRetries: 3,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.sessionRepository.create(newSession);
      this.logger.log(`Session created successfully for user ${userId}`);
      return right(null);
    }

    this.logger.log(
      `Updating session for user ${userId}: ${sessionExists.status} -> ${status}`,
    );

    sessionExists.updateStatus(status);
    await this.sessionRepository.update(sessionExists);

    this.logger.log(`Session updated successfully for user ${userId}`);

    return right(null);
  }
}

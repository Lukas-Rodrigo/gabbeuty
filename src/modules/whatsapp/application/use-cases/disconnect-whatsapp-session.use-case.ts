import { Either, left, right } from '@/_shared/either';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { Injectable } from '@nestjs/common';
import { WhatsappNotificationProvider } from '../providers/whatsapp-notification.provider';
import { WhatsAppSessionRepository } from '../../domain/repositories/whatsapp-session.repository';

export interface DisconnectSessionInput {
  userId: string;
}

type DisconnectSessionUseCaseOutput = Either<ResourceNotFoundError, null>;

@Injectable()
export class DisconnectWhatsappSessionUseCase {
  constructor(
    private readonly whatsappProvider: WhatsappNotificationProvider,
    private readonly sessionRepository: WhatsAppSessionRepository,
  ) {}

  async execute(
    input: DisconnectSessionInput,
  ): Promise<DisconnectSessionUseCaseOutput> {
    const { userId } = input;

    const session = await this.sessionRepository.findByUserId(userId);

    if (!session) {
      return left(
        new ResourceNotFoundError({
          msg: `Session not found for user: ${userId}`,
        }),
      );
    }
    if (!session.isConnected) {
      return left(new Error('No active session found for user.'));
    }

    await this.whatsappProvider.logout({
      userId,
    });

    return right(null);
  }
}

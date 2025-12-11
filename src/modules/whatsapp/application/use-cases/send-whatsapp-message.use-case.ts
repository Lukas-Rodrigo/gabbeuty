import { Injectable, Logger } from '@nestjs/common';
import { WhatsappNotificationProvider } from '../providers/whatsapp-notification.provider';
import { WhatsAppSessionRepository } from '../../domain/repositories/whatsapp-session.repository';
import { Either, left, right } from '@/_shared/either';
import { ContentMessage } from '../types/whatsapp-content-message.type';
import { PhoneNumber } from '../../domain/entities/value-object/phone-number';

interface SendWhatsappMessageInput {
  userId: string;
  phoneNumber: string;
  message: ContentMessage;
}

type SendWhatsappMessageOutput = Either<
  Error,
  {
    success: boolean;
    message: string;
  }
>;

@Injectable()
export class SendWhatsappMessageUseCase {
  private readonly logger = new Logger(SendWhatsappMessageUseCase.name);

  constructor(
    private readonly whatsappProvider: WhatsappNotificationProvider,
    private readonly sessionRepository: WhatsAppSessionRepository,
  ) {}

  async execute(
    input: SendWhatsappMessageInput,
  ): Promise<SendWhatsappMessageOutput> {
    const { userId, phoneNumber: phoneNumberStr, message } = input;

    this.logger.log(
      `Sending message from user: ${userId} to: ${phoneNumberStr}`,
    );

    const session = await this.sessionRepository.findByUserId(userId);

    if (!session) {
      return left(new Error(`Session not found for user: ${userId}`));
    }

    if (!session.isConnected) {
      return left(
        new Error(
          `Session not connected for user: ${userId}. Please connect first.`,
        ),
      );
    }

    const phoneNumber = PhoneNumber.create(phoneNumberStr);

    await this.whatsappProvider.sendMessage(userId, phoneNumber, message);

    this.logger.log(`Message sent successfully to: ${phoneNumberStr}`);
    return right({
      success: true,
      message: 'Message sent successfully',
    });
  }
}

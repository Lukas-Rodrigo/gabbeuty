import { PhoneNumber } from '../../domain/entities/value-object/phone-number';
import { WhatsAppSessionEntity } from '../../domain/entities/whatsapp-session.entity';

export abstract class WhatsappNotificationProvider {
  abstract connect(session: WhatsAppSessionEntity): Promise<void>;
  abstract logout(userId: { userId: string }): Promise<void>;

  abstract sendMessage(
    userId: string,
    phoneNumber: PhoneNumber,
    message: any,
  ): Promise<void>;
}

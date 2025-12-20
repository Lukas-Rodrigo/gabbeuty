import { WhatsappNotificationProvider } from '@/modules/whatsapp/application/providers/whatsapp-notification.provider';
import { WhatsAppSessionEntity } from '@/modules/whatsapp/domain/entities/whatsapp-session.entity';
import { ContentMessage } from '@/modules/whatsapp/application/types/whatsapp-content-message.type';
import { PhoneNumber } from '@/modules/whatsapp/domain/entities/value-object/phone-number';

interface SentMessage {
  userId: string;
  phoneNumber: string;
  message: ContentMessage;
}

export class FakeWhatsappNotificationProvider extends WhatsappNotificationProvider {
  public sentMessages: SentMessage[] = [];
  public connectedSessions: string[] = [];

  async connect(session: WhatsAppSessionEntity): Promise<void> {
    this.connectedSessions.push(session.userId);
  }

  async disconnect(userId: string): Promise<void> {
    const index = this.connectedSessions.indexOf(userId);
    if (index >= 0) {
      this.connectedSessions.splice(index, 1);
    }
  }

  async sendMessage(
    userId: string,
    phoneNumber: PhoneNumber,
    message: ContentMessage,
  ): Promise<void> {
    this.sentMessages.push({
      userId,
      phoneNumber: phoneNumber.getValue(),
      message,
    });
  }

  async logout(input: { userId: string }): Promise<void> {
    await this.disconnect(input.userId);
  }

  isConnected(userId: string): boolean {
    return this.connectedSessions.includes(userId);
  }
}

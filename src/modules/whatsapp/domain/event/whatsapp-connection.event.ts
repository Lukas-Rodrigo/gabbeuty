import { SessionStatus } from '../entities/whatsapp-session.entity';

export interface WhatsAppConnection {
  status: SessionStatus;
  userId: string;
}

import { WhatsAppSessionEntity } from '../entities/whatsapp-session.entity';

export abstract class WhatsAppSessionRepository {
  abstract create(session: WhatsAppSessionEntity): Promise<void>;
  abstract findById(id: string): Promise<WhatsAppSessionEntity | null>;
  abstract findByUserId(userId: string): Promise<WhatsAppSessionEntity | null>;
  abstract update(session: WhatsAppSessionEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findAll(): Promise<WhatsAppSessionEntity[]>;
}

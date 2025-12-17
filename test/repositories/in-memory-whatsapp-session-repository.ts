import { WhatsAppSessionRepository } from '@/modules/whatsapp/domain/repositories/whatsapp-session.repository';
import { WhatsAppSessionEntity } from '@/modules/whatsapp/domain/entities/whatsapp-session.entity';

export class InMemoryWhatsAppSessionRepository implements WhatsAppSessionRepository {
  public sessions: WhatsAppSessionEntity[] = [];

  async findByUserId(userId: string): Promise<WhatsAppSessionEntity | null> {
    const session = this.sessions.find((s) => s.userId === userId);
    return session ?? null;
  }

  async findById(id: string): Promise<WhatsAppSessionEntity | null> {
    const session = this.sessions.find((s) => s.id.toValue() === id);
    return session ?? null;
  }

  async save(session: WhatsAppSessionEntity): Promise<void> {
    const index = this.sessions.findIndex(
      (s) => s.id.toValue() === session.id.toValue(),
    );

    if (index >= 0) {
      this.sessions[index] = session;
    } else {
      this.sessions.push(session);
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.sessions.findIndex((s) => s.id.toValue() === id);
    if (index >= 0) {
      this.sessions.splice(index, 1);
    }
  }

  async create(session: WhatsAppSessionEntity): Promise<void> {
    this.sessions.push(session);
  }

  async update(session: WhatsAppSessionEntity): Promise<void> {
    const index = this.sessions.findIndex(
      (s) => s.id.toValue() === session.id.toValue(),
    );

    if (index >= 0) {
      this.sessions[index] = session;
    }
  }

  async findAll(): Promise<WhatsAppSessionEntity[]> {
    return this.sessions;
  }
}

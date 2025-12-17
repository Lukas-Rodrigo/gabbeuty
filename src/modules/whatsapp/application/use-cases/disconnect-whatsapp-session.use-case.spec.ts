import { describe, it, expect, beforeEach } from 'vitest';
import { DisconnectWhatsappSessionUseCase } from './disconnect-whatsapp-session.use-case';
import { InMemoryWhatsAppSessionRepository } from '@test/repositories/in-memory-whatsapp-session-repository';
import { FakeWhatsappNotificationProvider } from '@test/providers/fake-whatsapp-notification-provider';
import {
  WhatsAppSessionEntity,
  SessionStatus,
} from '../../domain/entities/whatsapp-session.entity';
import { faker } from '@faker-js/faker';

let sessionRepository: InMemoryWhatsAppSessionRepository;
let whatsappProvider: FakeWhatsappNotificationProvider;
let sut: DisconnectWhatsappSessionUseCase;

describe('DisconnectWhatsappSessionUseCase', () => {
  beforeEach(() => {
    sessionRepository = new InMemoryWhatsAppSessionRepository();
    whatsappProvider = new FakeWhatsappNotificationProvider();
    sut = new DisconnectWhatsappSessionUseCase(
      whatsappProvider,
      sessionRepository,
    );
  });

  it('should be able to disconnect a session', async () => {
    const userId = faker.string.uuid();

    const session = WhatsAppSessionEntity.create({
      userId,
      status: SessionStatus.CONNECTED,
      retryCount: 0,
      maxRetries: 3,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await sessionRepository.create(session);
    whatsappProvider.connectedSessions.push(userId);

    const result = await sut.execute({ userId });

    expect(result.isRight()).toBe(true);
    expect(whatsappProvider.connectedSessions).not.toContain(userId);
  });

  it('should not be able to disconnect non-existent session', async () => {
    const userId = faker.string.uuid();

    const result = await sut.execute({ userId });

    expect(result.isLeft()).toBe(true);
  });

  it('should not be able to disconnect already disconnected session', async () => {
    const userId = faker.string.uuid();

    const session = WhatsAppSessionEntity.create({
      userId,
      status: SessionStatus.DISCONNECTED,
      retryCount: 0,
      maxRetries: 3,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await sessionRepository.create(session);

    const result = await sut.execute({ userId });

    expect(result.isLeft()).toBe(true);
  });
});

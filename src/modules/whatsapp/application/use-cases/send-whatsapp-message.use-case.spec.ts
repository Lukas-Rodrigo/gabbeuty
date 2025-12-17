import { describe, it, expect, beforeEach } from 'vitest';
import { SendWhatsappMessageUseCase } from './send-whatsapp-message.use-case';
import { InMemoryWhatsAppSessionRepository } from '@test/repositories/in-memory-whatsapp-session-repository';
import { FakeWhatsappNotificationProvider } from '@test/providers/fake-whatsapp-notification-provider';
import {
  WhatsAppSessionEntity,
  SessionStatus,
} from '../../domain/entities/whatsapp-session.entity';
import { faker } from '@faker-js/faker';

let sessionRepository: InMemoryWhatsAppSessionRepository;
let whatsappProvider: FakeWhatsappNotificationProvider;
let sut: SendWhatsappMessageUseCase;

describe('SendWhatsappMessageUseCase', () => {
  beforeEach(() => {
    sessionRepository = new InMemoryWhatsAppSessionRepository();
    whatsappProvider = new FakeWhatsappNotificationProvider();
    sut = new SendWhatsappMessageUseCase(whatsappProvider, sessionRepository);
  });

  it('should be able to send a whatsapp message', async () => {
    const userId = faker.string.uuid();
    const phoneNumber = '5511999887766';
    const message = { text: 'Hello World' };

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

    const result = await sut.execute({
      userId,
      phoneNumber,
      message,
    });

    expect(result.isRight()).toBe(true);
    expect(whatsappProvider.sentMessages).toHaveLength(1);
    expect(whatsappProvider.sentMessages[0].phoneNumber).toBe(phoneNumber);
    expect(whatsappProvider.sentMessages[0].userId).toBe(userId);
  });

  it('should not be able to send message without session', async () => {
    const userId = faker.string.uuid();
    const phoneNumber = '5511999887766';
    const message = { text: 'Hello World' };

    const result = await sut.execute({
      userId,
      phoneNumber,
      message,
    });

    expect(result.isLeft()).toBe(true);
    expect(whatsappProvider.sentMessages).toHaveLength(0);
  });

  it('should not be able to send message with disconnected session', async () => {
    const userId = faker.string.uuid();
    const phoneNumber = '5511999887766';
    const message = { text: 'Hello World' };

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

    const result = await sut.execute({
      userId,
      phoneNumber,
      message,
    });

    expect(result.isLeft()).toBe(true);
    expect(whatsappProvider.sentMessages).toHaveLength(0);
  });
});

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { WhatsappNotificationProvider } from '../../application/providers/whatsapp-notification.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaileysSessionAdapter } from './baileys-session.adapter';
import { WhatsAppSessionEntity } from '../../domain/entities/whatsapp-session.entity';
import path from 'path';
import { PhoneNumber } from '../../domain/entities/value-object/phone-number';

import * as fs from 'fs/promises';

@Injectable()
export class BaileyWhatsappChatProvider
  implements WhatsappNotificationProvider, OnApplicationBootstrap
{
  private readonly logger = new Logger(BaileyWhatsappChatProvider.name);

  private readonly adapters = new Map<string, BaileysSessionAdapter>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async onApplicationBootstrap() {
    this.logger.log(
      '🚀 BaileyWhatsappChatProvider - Application fully bootstrapped',
    );
    this.logger.log("📡 Emitting 'whatsapp.session.hydration' event...");

    setTimeout(() => {
      this.eventEmitter.emit('whatsapp.session.hydration');
    }, 100);

    this.eventEmitter.on(
      'whatsapp.session.cleanup',
      this.handleSessionCleanup.bind(this),
    );
  }

  async connect(session: WhatsAppSessionEntity): Promise<void> {
    if (!this.adapters.has(session.userId)) {
      this.logger.log(
        `🔧 Creating new Baileys adapter for user: ${session.userId}`,
      );
      const adapter = new BaileysSessionAdapter(session, this.eventEmitter);
      this.adapters.set(session.userId, adapter);
      this.logger.log(`⚡ Initializing Baileys connection...`);
      await adapter.initialize();
      this.logger.log(`✅ Baileys adapter initialized`);
    }
  }

  async logout({ userId }: { userId: string }) {
    const adapter = this.adapters.get(userId);

    if (!adapter) {
      this.logger.warn(`⚠ No adapter found for user: ${userId}`);
      return;
    }
    await adapter.logout();
    this.adapters.delete(userId);
    this.logger.log(`✅ User logged out successfully: ${userId}`);
  }

  async handleSessionCleanup(data: {
    userId: string;
    reason: string;
  }): Promise<void> {
    this.logger.warn(
      `🧹 Cleaning up session for user: ${data.userId} (reason: ${data.reason})`,
    );

    const adapter = this.adapters.get(data.userId);
    if (adapter) {
      await adapter.disconnect();
      this.adapters.delete(data.userId);
      this.logger.log(`✅ Adapter removed for user: ${data.userId}`);
    }

    this.logger.log(`✅ Session removed for user: ${data.userId}`);
  }

  async deleteSession(userId: string): Promise<void> {
    this.logger.log(`🗑️ Manual deletion requested for user: ${userId}`);

    const adapter = this.adapters.get(userId);
    if (adapter) {
      await adapter.disconnect();
      await adapter.deleteSessionFiles();
    }

    this.logger.log(`✅ Session and adapter deleted for user: ${userId}`);
  }

  async deleteSessionFiles(userId: string): Promise<void> {
    const authPath = path.join(process.cwd(), 'sessions', userId);
    await fs.rm(authPath, { recursive: true, force: true });
  }

  async sendMessage(
    userId: string,
    phoneNumber: PhoneNumber,
    message: any,
  ): Promise<void> {
    const adapter = this.getAdapter(userId);

    if (!adapter) {
      return;
    }

    await adapter.sendMessage(phoneNumber, message);
  }

  getAdapter(userId: string): BaileysSessionAdapter | undefined {
    return this.adapters.get(userId);
  }
}

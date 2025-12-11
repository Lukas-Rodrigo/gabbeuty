import { TypedEventEmitter } from '@/infra/events/types/event-emitter.types';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs/promises';
import { Boom } from '@hapi/boom';
import qrCodeLib from 'qrcode';
import path from 'path';
import makeWASocket, {
  WASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} from 'whaileys';
import {
  SessionStatus,
  WhatsAppSessionEntity,
} from '../../domain/entities/whatsapp-session.entity';
import pino from 'pino';
import { WhatsappStartSession } from '../../domain/event/whatsapp-start-session.event';
import { WhatsAppMessageEvent } from '../../domain/event/whatsapp-message.event';
import { PhoneNumber } from '../../domain/entities/value-object/phone-number';

export class BaileysSessionAdapter {
  private readonly logger = new Logger(BaileysSessionAdapter.name);
  private sock: WASocket | null = null;
  private readonly typedEmitter: TypedEventEmitter;

  constructor(
    private readonly session: WhatsAppSessionEntity,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.typedEmitter = eventEmitter as unknown as TypedEventEmitter;
  }

  async initialize(): Promise<void> {
    const authPath = this.getAuthPath();
    await this.ensureAuthDirectory(authPath);

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    this.sock = this.createSocket(state, version);
    this.setupEventHandlers(saveCreds);
  }

  private async ensureAuthDirectory(authPath: string): Promise<void> {
    await fs.mkdir(authPath, { recursive: true });
  }

  private createSocket(state: any, version: any): WASocket {
    return makeWASocket({
      version,
      auth: state,
      browser: ['GabbeutyApp', 'Chrome', '1.0.0'],
      logger: pino({ level: 'silent' }) as any,
      printQRInTerminal: false,
      getMessage: async () => ({ conversation: '' }),
      syncFullHistory: false,
      markOnlineOnConnect: true,
      shouldSyncHistoryMessage: () => false,
      emitOwnEvents: false,
      fireInitQueries: true,
    });
  }

  private setupEventHandlers(saveCreds: () => Promise<void>): void {
    if (!this.sock) return;

    this.sock.ev.on('connection.update', (update) =>
      this.handleConnectionUpdate(update),
    );
    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('messages.upsert', (data) =>
      this.handleMessagesUpsert(data),
    );
  }

  private async handleConnectionUpdate(update: any): Promise<void> {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      await this.handleQRCode(qr);
    }

    if (connection === 'close') {
      await this.handleConnectionClose(lastDisconnect);
    }

    if (connection === 'open') {
      this.handleConnectionOpen();
    }
  }

  private async handleQRCode(qr: string): Promise<void> {
    this.logger.log(`🔵 QR Code generated for user: ${this.session.userId}`);

    const qrCode64 = await qrCodeLib.toDataURL(qr);

    this.typedEmitter.emit('whatsapp.qr', {
      qrCode: qrCode64,
      userId: this.session.userId,
    } as WhatsappStartSession);

    this.logger.debug(`✅ Event "whatsapp.qr" emitted successfully`);
  }

  private async handleConnectionClose(lastDisconnect: any): Promise<void> {
    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
    const errorMessage = lastDisconnect?.error?.message;

    this.logDisconnection(statusCode, errorMessage);

    if (this.isBadSession(statusCode, errorMessage)) {
      await this.handleBadSession();
      return;
    }

    if (statusCode === DisconnectReason.restartRequired) {
      await this.handleRestartRequired();
      return;
    }

    if (statusCode === DisconnectReason.loggedOut) {
      await this.handleLoggedOut();
      return;
    }

    this.logger.warn(
      `⚠️ Unhandled disconnect reason: ${statusCode} for user: ${this.session.userId}`,
    );
  }

  private logDisconnection(statusCode: number, errorMessage: string): void {
    this.logger.warn(`⚠️ Connection closed for user: ${this.session.userId}`);
    this.logger.warn(`📊 Status code: ${statusCode}`);
    this.logger.warn(`💬 Error message: ${errorMessage}`);
  }

  private isBadSession(statusCode: number, errorMessage?: string): boolean {
    const isBadStatusCode =
      statusCode === DisconnectReason.badSession || statusCode === 401;

    if (!isBadStatusCode) return false;

    this.logger.error(
      `❌ BAD SESSION detected for user: ${this.session.userId}`,
    );
    this.logger.error(`Error message: ${errorMessage}`);

    if (this.isAppStateSyncError(errorMessage)) {
      this.logger.error(
        `🔑 App state sync error detected - session files need to be regenerated`,
      );
    }

    return true;
  }

  private isAppStateSyncError(errorMessage?: string) {
    return (
      errorMessage?.includes('app state') || errorMessage?.includes('sync')
    );
  }

  private async handleRestartRequired(): Promise<void> {
    this.logger.log('♻️ Restart required — rebuilding socket...');
    await this.initialize();
  }

  private handleConnectionOpen(): void {
    this.logger.log(`✅ WhatsApp connected for user: ${this.session.userId}`);

    this.emitStatusUpdate(SessionStatus.CONNECTED);
  }

  private async handleMessagesUpsert({ messages, type }: any): Promise<void> {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (this.shouldIgnoreMessage(msg)) continue;

      const event = this.buildMessageEvent(msg);
      this.typedEmitter.emit('whatsapp.message', event);
    }
  }

  private shouldIgnoreMessage(msg: any): boolean {
    return !msg.message || msg.key.fromMe;
  }
  private buildMessageEvent(msg: any): WhatsAppMessageEvent {
    const buttonScope = msg.message.buttonsResponseMessage;

    return {
      userId: this.session.userId,
      message:
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '',
      from: msg.key.remoteJid || '',
      timestamp: Number(msg.messageTimestamp?.toLocaleString()),
      confirm: {
        appointmentId: buttonScope?.selectedButtonId,
        buttonMessage: buttonScope?.selectedDisplayText,
      },
    };
  }

  async sendMessage(phoneNumber: PhoneNumber, message: any): Promise<void> {
    if (!this.sock) {
      throw new Error(`Session not connected for user: ${this.session.userId}`);
    }

    await this.sock.sendMessage(phoneNumber.toJID(), message);
  }

  async logout(): Promise<void> {
    if (!this.sock) {
      this.logger.warn(`No active socket for user: ${this.session.userId}`);
      return;
    }

    this.logger.log(`🚪 Logging out user: ${this.session.userId}`);

    await this.sock.logout();
    await this.deleteSessionFiles();
    this.sock = null;

    this.emitStatusUpdate(SessionStatus.DISCONNECTED);
    this.logger.log(`✅ Logout successful for user: ${this.session.userId}`);
  }

  async disconnect(): Promise<void> {
    if (this.sock) {
      await this.sock.logout().catch(() => {});
      this.sock = null;
    }
  }

  async handleBadSession(): Promise<void> {
    this.logger.error(
      `🔴 Handling bad session for user: ${this.session.userId}`,
    );

    await this.deleteSessionFiles();

    this.typedEmitter.emit('whatsapp.session.cleanup', {
      userId: this.session.userId,
      reason: 'bad_session',
    });

    this.emitStatusUpdate(SessionStatus.DISCONNECTED);
  }

  private async handleLoggedOut(): Promise<void> {
    this.logger.warn(
      `⚠️ User logged out from WhatsApp: ${this.session.userId}`,
    );

    this.emitStatusUpdate(SessionStatus.DISCONNECTED);
  }

  private emitStatusUpdate(status: SessionStatus): void {
    this.typedEmitter.emit('whatsapp.update', {
      userId: this.session.userId,
      status,
    });
  }
  async deleteSessionFiles(): Promise<void> {
    const authPath = this.getAuthPath();
    await fs.rm(authPath, { recursive: true, force: true });
  }

  private getAuthPath(): string {
    return path.join(process.cwd(), 'sessions', this.session.userId);
  }
}

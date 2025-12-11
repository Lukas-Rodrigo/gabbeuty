import { Injectable, Logger } from '@nestjs/common';
import {
  SessionEventData,
  SessionEventListener,
} from '../../application/providers/session-event-listener.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BaileysSessionEventListenerAdapter implements SessionEventListener {
  private readonly logger = new Logger(BaileysSessionEventListenerAdapter.name);
  private readonly listeners = new Map<string, (data: any) => void>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async waitForEvent(
    eventName: string,
    userId: string,
    timeoutMs: number = 30000,
  ): Promise<SessionEventData> {
    const listenerKey = `${eventName}:${userId}`;

    this.logger.log(
      `⏳ Waiting for event "whatsapp.${eventName}" for user: ${userId} (timeout: ${timeoutMs}ms)`,
    );

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.cancelWait(eventName, userId);
        reject(new Error(`Timeout waiting for event "${eventName}"`));
      }, timeoutMs);

      const listener = (data: any) => {
        this.logger.debug(
          `🔔 Event received: whatsapp.${eventName} | Data:`,
          JSON.stringify(data, null, 2),
        );
        this.logger.debug(
          `Data userId: ${data?.userId} | Expected: ${userId} | Match: ${data?.userId === userId}`,
        );

        if (data.userId === userId) {
          clearTimeout(timeoutId);
          this.cancelWait(eventName, userId);

          this.logger.log(
            `✅ Event "${eventName}" received for user: ${userId}`,
          );

          resolve({
            userId: data.userId,
            qrCode: data.qrCode,
            connected: data.status === 'CONNECTED',
            error: data.error,
          });
        } else {
          this.logger.warn(
            `⚠️ Event userId mismatch! Expected: ${userId}, Got: ${data?.userId}`,
          );
        }
      };

      this.listeners.set(listenerKey, listener);
      this.eventEmitter.on(`whatsapp.${eventName}`, listener);

      this.logger.debug(
        `📡 Listener registered for event: whatsapp.${eventName}`,
      );
    });
  }

  cancelWait(eventName: string, userId: string): void {
    const listenerKey = `${eventName}:${userId}`;
    const listener = this.listeners.get(listenerKey);

    if (listener) {
      this.eventEmitter.removeListener(`whatsapp.${eventName}`, listener);
      this.listeners.delete(listenerKey);
      this.logger.log(
        `🔕 Cancelled listener for "${eventName}" (user: ${userId})`,
      );
    }
  }
}

import { WhatsAppConnection } from '@/modules/whatsapp/domain/event/whatsapp-connection.event';
import { WhatsAppDisconnection } from '@/modules/whatsapp/domain/event/whatsapp-disconnection.event';
import { WhatsAppMessageEvent } from '@/modules/whatsapp/domain/event/whatsapp-message.event';
import { WhatsappStartSession } from '@/modules/whatsapp/domain/event/whatsapp-start-session.event';

export interface ApplicationEvents {
  'whatsapp.message': WhatsAppMessageEvent;
  'whatsapp.qr': WhatsappStartSession;
  'whatsapp.update': WhatsAppConnection;
  'whatsapp.session.cleanup': WhatsAppDisconnection;
}

export type TypedEventEmitter = {
  emit<K extends keyof ApplicationEvents>(
    event: K,
    payload: ApplicationEvents[K],
  ): boolean;

  on<K extends keyof ApplicationEvents>(
    event: K,
    listener: (payload: ApplicationEvents[K]) => void | Promise<void>,
  ): void;

  once<K extends keyof ApplicationEvents>(
    event: K,
    listener: (payload: ApplicationEvents[K]) => void | Promise<void>,
  ): void;
};

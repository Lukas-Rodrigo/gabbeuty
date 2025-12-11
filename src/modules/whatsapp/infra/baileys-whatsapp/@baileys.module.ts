import { Module } from '@nestjs/common';
import { WhatsappNotificationProvider } from '../../application/providers/whatsapp-notification.provider';
import { BaileyWhatsappChatProvider } from './baileys-whatsapp-chat.provider';
import { SessionEventListener } from '../../application/providers/session-event-listener.provider';
import { BaileysSessionEventListenerAdapter } from './baileys-session-event-listener.adapter';

@Module({
  providers: [
    {
      provide: WhatsappNotificationProvider,
      useClass: BaileyWhatsappChatProvider,
    },
    {
      provide: SessionEventListener,
      useClass: BaileysSessionEventListenerAdapter,
    },
  ],
  exports: [WhatsappNotificationProvider, SessionEventListener],
})
export class BaileysModule {}

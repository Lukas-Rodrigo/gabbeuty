import { Module } from '@nestjs/common';
import { CreateWhatsAppSessionUseCase } from '../../application/use-cases/create-whatsapp-session.use-case';
import { DisconnectWhatsappSessionUseCase } from '../../application/use-cases/disconnect-whatsapp-session.use-case';
import { HandleWhatsappSessionUseCase } from '../../application/use-cases/handle-whatsapp-session.use-case';
import { SendWhatsappMessageUseCase } from '../../application/use-cases/send-whatsapp-message.use-case';
import { SessionBootstrapUseCase } from '../../application/use-cases/session-bootstrap.use-case';
import { BaileysModule } from '../baileys-whatsapp/@baileys.module';
import { WhatsappDatabaseModule } from '../database/@database.module';

@Module({
  imports: [WhatsappDatabaseModule, BaileysModule],
  providers: [
    CreateWhatsAppSessionUseCase,
    DisconnectWhatsappSessionUseCase,
    HandleWhatsappSessionUseCase,
    SendWhatsappMessageUseCase,
    SessionBootstrapUseCase,
  ],
  exports: [
    CreateWhatsAppSessionUseCase,
    DisconnectWhatsappSessionUseCase,
    HandleWhatsappSessionUseCase,
    SendWhatsappMessageUseCase,
    SessionBootstrapUseCase,
  ],
})
export class WhatsappUseCasesModule {}

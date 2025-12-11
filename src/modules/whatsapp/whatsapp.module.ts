import { Module } from '@nestjs/common';
import { WhatsappUseCasesModule } from './infra/use-cases/whatsapp-use-cases.module';
import { WhatsappSessionController } from './infra/http/controllers/whatsapp-session.controller';
import { WhatsappEventsModule } from './infra/events/whatsapp.events.module';

@Module({
  imports: [WhatsappUseCasesModule, WhatsappEventsModule],
  controllers: [WhatsappSessionController],
  providers: [],
  exports: [],
})
export class WhatsappModule {}

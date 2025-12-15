import { Module } from '@nestjs/common';
import { WhatsappUseCasesModule } from '../use-cases/whatsapp-use-cases.module';
import { WhatsAppSessionHandle } from './integration-handler/whatsapp.session.handler';
import { WhatsappBootstrapSessionHandler } from './integration-handler/whatsapp-bootstrap-session.handler';

@Module({
  imports: [WhatsappUseCasesModule],
  providers: [WhatsAppSessionHandle, WhatsappBootstrapSessionHandler],
})
export class WhatsappEventsModule {
  // constructor(
  //   private notificationWhatsAppHandler: NotificationWhatsAppHandler,
  // ) {}
  // onModuleInit() {
  //   DomainEvents.register(
  //     'AppointmentCreatedEvent',
  //     this.notificationWhatsAppHandler,
  //   );
  //   console.log('✅ Domain event handlers registered');
  // }
}

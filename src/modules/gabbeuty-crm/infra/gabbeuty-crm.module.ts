import { Module, OnModuleInit } from '@nestjs/common';
import { AppointmentUseCasesModule } from './use-cases/appointments-use-cases.module';
import { AppointmentsController } from './http/controllers/appointments.controller';
import { WhatsappModule } from '@/modules/whatsapp/whatsapp.module';
import { CrmDatabaseModule } from './database/@database.module';
import { BusinessServiceUseCaseModule } from './use-cases/business-service-use-cases.module';
import { BusinessServicesController } from './http/controllers/business-services.controller';
import { ClientsController } from './http/controllers/clients.controller';
import { ClientsUseCaseModule } from './use-cases/clients-use-cases.module';

import { AppointmentCreatedHandler } from '../application/handlers/appointment-created.handler';
import { OnMessageWhatsappHandler } from './events/integrations-handler/on-message-whatsapp.handler';
import { DomainEvents } from '@/_shared/event/domain-events';
import { AppointmentPatchHandler } from '../application/handlers/appointment-patch.handler';

@Module({
  imports: [
    CrmDatabaseModule, // Import database module to get repositories
    AppointmentUseCasesModule,
    BusinessServiceUseCaseModule,
    ClientsUseCaseModule,
    WhatsappModule, // Import WhatsApp module to get NotificationService implementation
  ],
  controllers: [
    AppointmentsController,
    BusinessServicesController,
    ClientsController,
  ],
  providers: [
    OnMessageWhatsappHandler,
    AppointmentCreatedHandler,
    AppointmentPatchHandler,
  ],
  exports: [],
})
export class GabbeutyCrmModule implements OnModuleInit {
  constructor(
    private appointmentCreatedHandler: AppointmentCreatedHandler,
    private appointmentPatchHandler: AppointmentPatchHandler,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      'AppointmentCreatedEvent',
      this.appointmentCreatedHandler,
    );

    DomainEvents.register(
      'AppointmentPatchEvent',
      this.appointmentPatchHandler,
    );

    console.log('✅ Domain event handlers registered');
  }
}

import { Module } from '@nestjs/common';

import { AppointmentNotificationService } from '../../application/services/notification-whatsapp-appointment.service';
import { CrmDatabaseModule } from '@/modules/gabbeuty-crm/infra/database/@database.module';
import { WhatsappUseCasesModule } from '../use-cases/whatsapp-use-cases.module';
import { NotificationSyncProcessor } from './bull/processors/notification-whatsapp.processor';

@Module({
  imports: [CrmDatabaseModule, WhatsappUseCasesModule],
  providers: [AppointmentNotificationService, NotificationSyncProcessor],
  exports: [NotificationSyncProcessor],
})
export class NotificationWhatsappQueueModule {}

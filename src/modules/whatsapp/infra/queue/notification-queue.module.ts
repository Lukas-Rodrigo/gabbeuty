import { Module } from '@nestjs/common';

import { CrmDatabaseModule } from '@/modules/gabbeuty-crm/infra/database/@database.module';
import { WhatsappUseCasesModule } from '../use-cases/whatsapp-use-cases.module';
import { NotificationSyncProcessor } from './bull/processors/notification-whatsapp.processor';

@Module({
  imports: [CrmDatabaseModule, WhatsappUseCasesModule],
  providers: [NotificationSyncProcessor],
  exports: [NotificationSyncProcessor],
})
export class NotificationWhatsappQueueModule {}

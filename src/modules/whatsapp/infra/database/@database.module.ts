import { Module } from '@nestjs/common';
import { WhatsAppSessionRepository } from '../../domain/repositories/whatsapp-session.repository';
import { PrismaWhatsappSession } from './prisma/prisma-whatsapp-session.repository';
import { SharedDatabaseModule } from '@/infra/database/@database.module';

@Module({
  imports: [SharedDatabaseModule],
  providers: [
    {
      provide: WhatsAppSessionRepository,
      useClass: PrismaWhatsappSession,
    },
  ],
  exports: [WhatsAppSessionRepository],
})
export class WhatsappDatabaseModule {}

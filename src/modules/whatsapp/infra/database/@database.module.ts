import { Module } from '@nestjs/common';
import { WhatsAppSessionRepository } from '../../domain/repositories/whatsapp-session.repository';
import { PrismaWhatsappSession } from './prisma/prisma-whatsapp-session.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.provider';

@Module({
  imports: [],
  providers: [
    PrismaService,
    {
      provide: WhatsAppSessionRepository,
      useClass: PrismaWhatsappSession,
    },
  ],
  exports: [WhatsAppSessionRepository],
})
export class WhatsappDatabaseModule {}

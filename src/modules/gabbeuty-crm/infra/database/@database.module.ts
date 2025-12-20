import { Module } from '@nestjs/common';
import { AppointmentsRepository } from '../../domain/repositories/appointments.repository';
import { PrismaAppointmentRepository } from './prisma/prisma-appointments.repository';
import { BusinessServicesRepository } from '../../domain/repositories/business-services.repository';
import { PrismaBusinessServiceRepository } from './prisma/prisma-business-services-repository';
import { ClientsRepository } from '../../domain/repositories/clients.repository';
import { PrismaClientsRepository } from './prisma/prisma-clients.repository';
import { SharedDatabaseModule } from '@/_shared/_infra/database/@database.module';

@Module({
  imports: [SharedDatabaseModule],
  providers: [
    {
      provide: AppointmentsRepository,
      useClass: PrismaAppointmentRepository,
    },
    {
      provide: BusinessServicesRepository,
      useClass: PrismaBusinessServiceRepository,
    },
    {
      provide: ClientsRepository,
      useClass: PrismaClientsRepository,
    },
  ],
  exports: [
    AppointmentsRepository,
    SharedDatabaseModule,
    ClientsRepository,
    BusinessServicesRepository,
  ],
})
export class CrmDatabaseModule {}

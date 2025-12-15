import { Module } from '@nestjs/common';
import { CrmDatabaseModule } from '../database/@database.module';
import { CreateAppointmentUseCase } from '../../application/use-cases/appointments/create-appointment.use-case';
import { FetchAppointmentUseCase } from '../../application/use-cases/appointments/fetch-appointments.use-case';
import { FetchAppointmentMetricsUseCase } from '../../application/use-cases/appointments/fetch-appointment-metrics.use-case';
import { FetchInvoicingUseCase } from '../../application/use-cases/appointments/fetch-invoicing.use-case';
import { PatchAppointmentUseCase } from '../../application/use-cases/appointments/patch-appointment.use-case';
import { CountAppointmentByStatusUseUseCase } from '../../application/use-cases/appointments/count-status-appointment-by-status.use-case';

@Module({
  imports: [CrmDatabaseModule],
  providers: [
    CreateAppointmentUseCase,
    FetchAppointmentUseCase,
    FetchAppointmentMetricsUseCase,
    FetchInvoicingUseCase,
    PatchAppointmentUseCase,
    CountAppointmentByStatusUseUseCase,
  ],
  exports: [
    CreateAppointmentUseCase,
    FetchAppointmentUseCase,
    FetchAppointmentMetricsUseCase,
    FetchInvoicingUseCase,
    PatchAppointmentUseCase,
    CountAppointmentByStatusUseUseCase,
  ],
})
export class AppointmentUseCasesModule {}

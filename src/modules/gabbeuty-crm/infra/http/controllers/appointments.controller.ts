import { CurrentUser } from '@/modules/auth/infra/jwt/current-user.decorator';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { CreateAppointmentUseCase } from '@/modules/gabbeuty-crm/application/use-cases/appointments/create-appointment.use-case';
import { mapDomainErrorToHttpException } from '@/_shared/filters/map-domain-error';
import { FetchAppointmentUseCase } from '@/modules/gabbeuty-crm/application/use-cases/appointments/fetch-appointments.use-case';
import { FiltersFetchQueriesDto } from '../dto/filters-fetch-queries.dto';
import { CountAppointmentByStatusUseUseCase } from '@/modules/gabbeuty-crm/application/use-cases/appointments/count-status-appointment-by-status.use-case';
import { DateRangeDto } from '../dto/date-range-query.dto';
import { CountAppointmentByStatusBodyDto } from '../dto/count-appointment-by-status-body.dto';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';
import { FetchAppointmentMetricsUseCase } from '@/modules/gabbeuty-crm/application/use-cases/appointments/fetch-appointment-metrics.use-case';
import { FetchInvoicingUseCase } from '@/modules/gabbeuty-crm/application/use-cases/appointments/fetch-invoicing.use-case';
import { PatchAppointmentUseCase } from '@/modules/gabbeuty-crm/application/use-cases/appointments/patch-appointment.use-case';
import { UUIDParamDto } from '../dto/uuid-param.dto';
import { PatchAppointmentDto } from '../dto/patch-appointments.dto';
import { AppointmentsApiDoc } from '@/_shared/docs/swagger.decorators';

@Controller('appointments')
export class AppointmentsController {
  private log = new Logger(AppointmentsController.name);

  constructor(
    private createAppointmentUseCase: CreateAppointmentUseCase,
    private patchAppointmentsUseCase: PatchAppointmentUseCase,
    private fetchAppointmentUseCase: FetchAppointmentUseCase,
    private countAppointmentsByStatusUseCase: CountAppointmentByStatusUseUseCase,
    private fetchAppointmentsMetricsUseCase: FetchAppointmentMetricsUseCase,
    private fetchInvoicingUseCase: FetchInvoicingUseCase,
  ) {}

  @AppointmentsApiDoc.Create()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user, @Body() body: CreateAppointmentDto) {
    console.log({
      user,
      body,
    });

    const { clientId, date, servicesIds, status } = body;
    const serviceIdsMapped = servicesIds.map((serviceid) => serviceid.id);

    const result = await this.createAppointmentUseCase.execute({
      professionalId: user.sub,
      clientId,
      date: new Date(date),
      servicesIds: serviceIdsMapped,
      status,
    });

    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }

    return result.value;
  }

  @AppointmentsApiDoc.Update()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async patch(
    @CurrentUser() user,
    @Param() params: UUIDParamDto,
    @Body() body: PatchAppointmentDto,
  ) {
    const { date, servicesIds, status, title } = body;
    const { id: appointmentId } = params;
    const professionalId = user.sub;

    // Mapeia servicesIds se fornecido
    const serviceIdsMapped = servicesIds?.map((service) => service.id);

    const statusEnum = status ? AppointmentStatus[status] : undefined;

    const result = await this.patchAppointmentsUseCase.execute({
      appointmentId,
      professionalId,
      status: statusEnum,
      date: date ? new Date(date) : undefined,
      title,
      servicesIds: serviceIdsMapped,
    });

    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }

    return result.value;
  }

  @AppointmentsApiDoc.Fetch()
  @Get()
  @HttpCode(HttpStatus.OK)
  async fetch(@CurrentUser() user, @Query() queries: FiltersFetchQueriesDto) {
    const { page, perPage } = queries;
    const { endDate, startDate } = queries.getProcessedDates();
    const result = await this.fetchAppointmentUseCase.execute({
      dateRange: {
        endDate,
        startDate,
      },
      pagination: {
        page,
        perPage,
      },
      professionalId: user.sub,
    });
    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }

    return result.value;
  }

  @AppointmentsApiDoc.CountByStatus()
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async countAppointmentByStatus(
    @CurrentUser() user,
    @Query() queries: DateRangeDto,
    @Body() body: CountAppointmentByStatusBodyDto,
  ) {
    this.log.log('Request to count appointments by status');

    const { startDate, endDate } = queries.getProcessedDatesWithInterval({
      intervalDays: 30,
    });
    const { status } = body;

    const result = await this.countAppointmentsByStatusUseCase.execute({
      dateRange: {
        startDate,
        endDate,
      },
      professionalId: user.sub,
      status: AppointmentStatus[status],
    });
    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }
    return result.value;
  }

  @AppointmentsApiDoc.FetchMetrics()
  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  async fetchAppointmentsMetrics(
    @CurrentUser() user,
    @Query() queries: DateRangeDto,
  ) {
    this.log.log('Request to fetch appointments by metrics');

    const { startDate, endDate } = queries.getProcessedDatesWithInterval({
      intervalDays: 30,
    });

    const result = await this.fetchAppointmentsMetricsUseCase.execute({
      dateRange: {
        startDate,
        endDate,
      },
      professionalId: user.sub,
    });
    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }
    return result.value;
  }

  @AppointmentsApiDoc.FetchInvoicing()
  @Get('invoicing')
  @HttpCode(HttpStatus.OK)
  async fetchInvoicing(@CurrentUser() user, @Query() queries: DateRangeDto) {
    this.log.log('Request to fetch appointments invoicing');

    const { startDate, endDate } = queries.getProcessedDatesWithInterval({
      intervalDays: 30,
    });

    const result = await this.fetchInvoicingUseCase.execute({
      dateRange: {
        startDate,
        endDate,
      },
      professionalId: user.sub,
    });
    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }
    return result.value;
  }
}

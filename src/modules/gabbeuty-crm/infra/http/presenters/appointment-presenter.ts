import { DateRange } from '@/_shared/entities/date-range';
import { PaginationParam } from '@/_shared/entities/pagination-param';
import { AppointmentMetrics } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-metrics.vo';
import { AppointmentDetails } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-with-client.vo';

export class AppointmentPresenter {
  static toHTTP(appointmentDetails: AppointmentDetails) {
    const { appointment, client, services } = appointmentDetails;
    return {
      id: appointment.id.toValue(),
      title: appointment.title,
      date: appointment.date,
      status: appointment.status,
      client: {
        id: client.id.toValue(),
        name: client.name,
        phone: client.phoneNumber,
      },
      services: services.map((service) => ({
        id: service.id.toValue(),
        name: service.name,
        price: service.price,
        duration: service.duration,
      })),
      totalPrice: appointmentDetails.getTotalPrice(),
      totalDuration: appointmentDetails.getTotalDuration(),
    };
  }

  static toFetchHTTP({
    appointmentDetails,
    dateRange,
    pagination,
  }: {
    appointmentDetails: AppointmentDetails[];
    dateRange: DateRange;
    pagination: PaginationParam;
  }) {
    const { startDate, endDate } = dateRange;
    const { page, perPage } = pagination;
    return {
      appointments: appointmentDetails.map((appointment) =>
        this.toHTTP(appointment),
      ),
      page,
      perPage,
      total: appointmentDetails.length,
      filters: {
        startDate,
        endDate,
      },
    };
  }

  static toCountHTTP({
    total,
    dateRange,
  }: {
    total: number;
    dateRange: DateRange;
  }) {
    const { startDate, endDate } = dateRange;
    return {
      total,
      filters: {
        startDate,
        endDate,
      },
    };
  }

  static metricsToHTTP({
    metrics,
    dateRange,
  }: {
    metrics: AppointmentMetrics;
    dateRange: DateRange;
  }) {
    const { startDate, endDate } = dateRange;
    return {
      invoicing: {
        total: metrics.invoicing,
      },
      metrics: {
        confirmed: metrics.confirmed,
        pending: metrics.pending,
        canceled: metrics.canceled,
        completed: metrics.completed,
        total: metrics.total,
        completionRate: metrics.completionRate,
        cancellationRate: metrics.cancellationRate,
      },
      filters: {
        startDate,
        endDate,
      },
    };
  }

  static invoicingToHTTP({
    dateRange,
    invoicing,
  }: {
    dateRange: DateRange;
    invoicing: number;
  }) {
    const { startDate, endDate } = dateRange;
    return {
      data: {
        total: invoicing,
      },
      filters: {
        startDate,
        endDate,
      },
    };
  }
}

import { DateRange } from '@/_shared/entities/date-range';
import { PaginationParam } from '@/_shared/entities/pagination-param';
import { Appointment } from '@/modules/gabbeuty-crm/domain/entities/appointment.entity';
import { AppointmentDetailsView } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-details-view';
import { AppointmentsRepository } from '@/modules/gabbeuty-crm/domain/repositories/appointments.repository';
import { PrismaAppointmentMapper } from './mapper/prisma-appointment.mapper';
import { DomainEvents } from '@/_shared/event/domain-events';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';
import { Injectable } from '@nestjs/common';
import { AppointmentMetrics } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-metrics.vo';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';
import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';

@Injectable()
export class PrismaAppointmentRepository implements AppointmentsRepository {
  constructor(private prismaService: PrismaProvider) {}

  async save(
    appointmentId: string,
    appointment: Appointment,
  ): Promise<AppointmentDetailsView> {
    const servicesData = PrismaAppointmentMapper.servicesToPrisma(appointment);

    //  2. Executar tudo em uma transação atômica
    await this.prismaService.$transaction([
      // 2.1. Atualizar dados principais do appointment
      this.prismaService.appointment.update({
        where: { id: appointmentId },
        data: {
          status: appointment.status,
          title: appointment.title,
          date: appointment.date,
        },
      }),

      // 2.2. Deletar APENAS os services removidos (WatchedList.getRemovedItems())
      ...(servicesData.toDelete.length > 0
        ? [
            this.prismaService.appointmentService.deleteMany({
              where: {
                id: {
                  in: servicesData.toDelete,
                },
              },
            }),
          ]
        : []),

      // 2.3. Inserir APENAS os services novos (WatchedList.getNewItems())
      ...(servicesData.toCreate.length > 0
        ? servicesData.toCreate.map((service) =>
            this.prismaService.appointmentService.create({
              data: {
                id: service.id,
                appointmentId,
                serviceId: service.serviceId,
                serviceName: service.serviceName,
                price: service.price,
                duration: service.duration,
                order: service.order,
              },
            }),
          )
        : []),
    ]);

    const appointmentPrisma = await this.prismaService.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        appointmentServices: {
          include: {
            service: true,
          },
        },
      },
    });
    if (!appointmentPrisma) {
      throw new Error('Appointment not found after save');
    }
    DomainEvents.dispatchEventsForAggregate(new UniqueEntityID(appointmentId));

    return PrismaAppointmentMapper.toDomainWithClient(appointmentPrisma);
  }

  async create(appointment: Appointment): Promise<AppointmentDetailsView> {
    const data = PrismaAppointmentMapper.toPrisma(appointment);

    const newAppointment = await this.prismaService.appointment.create({
      data,
      include: {
        client: true,
        appointmentServices: {
          include: {
            service: true,
          },
        },
      },
    });

    DomainEvents.dispatchEventsForAggregate(
      new UniqueEntityID(newAppointment.id),
    );

    return PrismaAppointmentMapper.toDomainWithClient(newAppointment);
  }

  async findById(appointmentId: string): Promise<Appointment | null> {
    console.log('Appointment id (find by id): ', appointmentId);
    const appointmentFound = await this.prismaService.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        appointmentServices: true,
      },
    });

    if (!appointmentFound) {
      return null;
    }

    return PrismaAppointmentMapper.toDomain(appointmentFound);
  }

  async fetchIAppointmentsByProfessionalId(
    professionalId: string,
  ): Promise<Appointment[]> {
    const appointments = await this.prismaService.appointment.findMany({
      where: {
        professionalId,
      },
      include: {
        appointmentServices: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return appointments.map((appointment) =>
      PrismaAppointmentMapper.toDomain(appointment),
    );
  }

  async fetchAppointmentsWithClientByProfessionalId(
    professionalId: string,
    pagination: PaginationParam,
    dateRange: DateRange,
  ): Promise<AppointmentDetailsView[]> {
    const { page, perPage } = pagination;
    const { startDate, endDate } = dateRange;
    const appointments = await this.prismaService.appointment.findMany({
      where: {
        professionalId,
        date: {
          gte: startDate, // Greater than or equal (maior ou igual)
          lte: endDate, // Less than or equal (menor ou igual)
        },
      },
      include: {
        client: true,
        appointmentServices: {
          include: {
            service: true,
          },
        },
      },
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: { date: 'asc' },
    });

    return appointments.map((appointment) =>
      PrismaAppointmentMapper.toDomainWithClient(appointment),
    );
  }

  async fetchInvoicingByProfessionalId(
    professionalId: string,
  ): Promise<number> {
    const completedServices =
      await this.prismaService.appointmentService.findMany({
        where: {
          appointment: {
            status: 'COMPLETED',
            professionalId: professionalId,
          },
        },
        include: {
          service: true,
          appointment: true,
        },
      });

    return completedServices.reduce((total, appointmentService) => {
      return total + Number(appointmentService.service.price);
    }, 0);
  }

  async fetchAppointmentByStatusByPeriod(
    professionalId: string,
    status: AppointmentStatus,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    const completedAppointment = await this.prismaService.appointment.findMany({
      where: {
        status: status,
        professionalId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        appointmentServices: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return completedAppointment.map((appointment) =>
      PrismaAppointmentMapper.toDomain(appointment),
    );
  }
  async countAppointmentByStatusByPeriod(
    professionalId: string,
    status: AppointmentStatus,
    dateRange: DateRange,
  ): Promise<number> {
    const { endDate, startDate } = dateRange;
    const result = await this.prismaService.appointment.count({
      where: {
        status: status,
        professionalId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return result;
  }

  async fetchAppointmentsMetrics(
    professionalId: string,
    dateRange: DateRange,
  ): Promise<AppointmentMetrics> {
    const { startDate, endDate } = dateRange;

    // Executar todas as queries em paralelo para melhor performance
    const [completedServices, confirmed, pending, canceled, completed] =
      await Promise.all([
        // 1. Buscar faturamento (serviços de appointments COMPLETED no período)
        this.prismaService.appointmentService.findMany({
          where: {
            appointment: {
              status: 'COMPLETED',
              professionalId,
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          include: {
            service: {
              select: {
                price: true, // Selecionar apenas o campo necessário
              },
            },
          },
        }),
        // 2. Contar appointments CONFIRMED no período
        this.prismaService.appointment.count({
          where: {
            professionalId,
            status: 'CONFIRMED',
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        // 3. Contar appointments PENDING no período
        this.prismaService.appointment.count({
          where: {
            professionalId,
            status: 'PENDING',
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        // 4. Contar appointments CANCELED no período
        this.prismaService.appointment.count({
          where: {
            professionalId,
            status: 'CANCELED',
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        // 5. Contar appointments COMPLETED no período
        this.prismaService.appointment.count({
          where: {
            professionalId,
            status: 'COMPLETED',
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
      ]);

    // Calcular faturamento total
    const invoicing = completedServices.reduce(
      (total, appointmentService) =>
        total + Number(appointmentService.service.price),
      0,
    );

    return AppointmentMetrics.create({
      invoicing,
      confirmed,
      pending,
      canceled,
      completed,
    });
  }
}

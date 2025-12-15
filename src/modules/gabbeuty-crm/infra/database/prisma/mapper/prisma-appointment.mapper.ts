import { UniqueEntityID } from '@/_shared/value-objects/unique-entity-id.vo';
import { Appointment } from '@/modules/gabbeuty-crm/domain/entities/appointment.entity';
import { BusinessService } from '@/modules/gabbeuty-crm/domain/entities/business-service.entity';
import { Client } from '@/modules/gabbeuty-crm/domain/entities/client.entity';
import { AppointmentServiceList } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appoinment-service-list';
import { AppointmentService } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-service';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';
import { AppointmentDetails } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-with-client.vo';
import {
  AppointmentStatus as PrismaAppointmentStatus,
  Prisma,
  Appointment as PrismaAppointment,
  Client as PrismaClient,
  BusinessService as PrismaBusinessService,
  AppointmentService as PrismaAppointmentService,
} from '@prisma/client';

type PrismaAppointmentWithServices = PrismaAppointment & {
  appointmentServices: PrismaAppointmentService[];
};

type PrismaAppointmentWithClientAndServices = PrismaAppointment & {
  client: PrismaClient;
  appointmentServices: Array<
    PrismaAppointmentService & {
      service: PrismaBusinessService;
    }
  >;
};

export class PrismaAppointmentMapper {
  static toDomain(raw: PrismaAppointmentWithServices): Appointment {
    const appointmentServices = raw.appointmentServices.map((service) => {
      return AppointmentService.create(
        {
          price: Number(service.price),
          serviceId: new UniqueEntityID(service.serviceId),
          serviceName: service.serviceName,
          duration: service.duration,
          order: service.order,
          createdAt: service.createdAt,
        },
        service.id,
      );
    });
    const services = new AppointmentServiceList(appointmentServices);
    const status = this.mapPrismaStatusToDomain(raw.status);
    return Appointment.reconstitute(
      {
        clientId: new UniqueEntityID(raw.clientId),
        date: new Date(raw.date),
        title: raw.title,
        professionalId: new UniqueEntityID(raw.professionalId),
        services,
        status,
      },
      raw.id,
    );
  }

  static servicesToPrisma(appointment: Appointment) {
    return {
      // ✅ IDs dos services removidos (para DELETE)
      toDelete: appointment.services
        .getRemovedItems()
        .map((service) => service.id.toValue()),

      // ✅ Dados dos services novos (para INSERT)
      toCreate: appointment.services.getNewItems().map((service) => ({
        id: service.id.toValue(),
        serviceId: service.serviceId.toValue(),
        serviceName: service.serviceName,
        price: service.price,
        duration: service.duration,
        order: service.order,
      })),

      // ✅ Todos os services atuais (para referência/debug)
      current: appointment.services.getItems().map((service) => ({
        id: service.id.toValue(),
        serviceId: service.serviceId.toValue(),
        serviceName: service.serviceName,
        price: service.price,
        duration: service.duration,
        order: service.order,
      })),
    };
  }

  static toPrisma(appointment: Appointment): Prisma.AppointmentCreateInput {
    const status = this.mapDomainStatusToPrisma(appointment.status);

    return {
      id: appointment.id.toValue(),
      date: appointment.date,
      title: appointment.title,
      createdAt: appointment.createdAt,
      status,
      client: {
        connect: { id: appointment.clientId.toValue() },
      },
      user: {
        connect: { id: appointment.professionalId.toValue() },
      },
      appointmentServices: {
        create: appointment.services.getItems().map((service) => ({
          id: service.id.toValue(),
          serviceName: service.serviceName,
          price: service.price,
          duration: service.duration,
          order: service.order,
          service: {
            connect: { id: service.serviceId.toValue() },
          },
        })),
      },
    };
  }

  static toDomainWithClient(
    raw: PrismaAppointmentWithClientAndServices,
  ): AppointmentDetails {
    const appointmentServices = raw.appointmentServices.map((service) =>
      AppointmentService.create(
        {
          serviceId: new UniqueEntityID(service.serviceId),
          serviceName: service.serviceName,
          price: Number(service.price),
          duration: service.duration,
          order: service.order,
        },
        service.id,
      ),
    );
    const appointmentEntity = Appointment.reconstitute(
      {
        title: raw.title,
        date: raw.date,
        professionalId: new UniqueEntityID(raw.professionalId),
        clientId: new UniqueEntityID(raw.clientId),
        services: new AppointmentServiceList(appointmentServices),
        status: this.mapPrismaStatusToDomain(raw.status),
        createdAt: raw.createdAt,
      },
      raw.id,
    );

    const clientEntity = Client.create(
      {
        name: raw.client.name,
        phoneNumber: raw.client.phoneNumber,
        professionalId: new UniqueEntityID(raw.client.professionalId),
        profileUrl: raw.client.profileUrl,
        observation: raw.client.observation,
        createdAt: raw.client.createdAt,
      },
      raw.client.id,
    );

    const servicesEntities = raw.appointmentServices.map((appointmentService) =>
      BusinessService.create(
        {
          name: appointmentService.service.name,
          price: Number(appointmentService.service.price),
          duration: appointmentService.service.duration,
          professionalId: new UniqueEntityID(
            appointmentService.service.professionalId,
          ),
          createdAt: appointmentService.service.createdAt,
        },
        appointmentService.service.id,
      ),
    );

    return AppointmentDetails.create({
      appointment: appointmentEntity,
      client: clientEntity,
      services: servicesEntities,
    });
  }

  private static mapPrismaStatusToDomain(
    prismaStatus: PrismaAppointmentStatus,
  ): AppointmentStatus {
    switch (prismaStatus) {
      case 'PENDING':
        return AppointmentStatus.PENDING;
      case 'CONFIRMED':
        return AppointmentStatus.CONFIRMED;
      case 'CANCELED':
        return AppointmentStatus.CANCELED;
      case 'COMPLETED':
        return AppointmentStatus.COMPLETED;
      default:
        return AppointmentStatus.PENDING;
    }
  }

  private static mapDomainStatusToPrisma(
    domainStatus: AppointmentStatus,
  ): PrismaAppointmentStatus {
    switch (domainStatus) {
      case AppointmentStatus.PENDING:
        return 'PENDING';
      case AppointmentStatus.CONFIRMED:
        return 'CONFIRMED';
      case AppointmentStatus.COMPLETED:
        return 'COMPLETED';
      case AppointmentStatus.CANCELED:
        return 'CANCELED';
      default:
        return 'PENDING';
    }
  }
}

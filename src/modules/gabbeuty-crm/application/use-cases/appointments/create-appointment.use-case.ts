import { Either, left, right } from '@/_shared/either';
import { NotBelongsError } from '@/_shared/errors/not-belongs.error';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { UserRepository } from '@/_shared/repositories/user.repository';
import { UniqueEntityID } from '@/_shared/value-objects/unique-entity-id.vo';
import { Appointment } from '@/modules/gabbeuty-crm/domain/entities/appointment.entity';
import { AppointmentServiceList } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appoinment-service-list';
import { AppointmentService } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-service';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';
import { AppointmentsRepository } from '@/modules/gabbeuty-crm/domain/repositories/appointments.repository';
import { BusinessServicesRepository } from '@/modules/gabbeuty-crm/domain/repositories/business-services.repository';
import { ClientsRepository } from '@/modules/gabbeuty-crm/domain/repositories/clients.repository';
import { Injectable } from '@nestjs/common';

export interface CreateAppointmentRequest {
  date: Date;
  professionalId: string;
  clientId: string;
  servicesIds: string[];
  status?: 'PENDING' | 'CONFIRMED';
}

type CreateAppointmentResponse = Either<
  Error,
  {
    appointment: Appointment;
  }
>;

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentsRepository,
    private userRepository: UserRepository,
    private clientsRepository: ClientsRepository,
    private businessServicesRepository: BusinessServicesRepository,
  ) {}
  async execute({
    date,
    professionalId,
    clientId,
    servicesIds,
    status = 'PENDING',
  }: CreateAppointmentRequest): Promise<CreateAppointmentResponse> {
    const isValidProfessional =
      await this.userRepository.findById(professionalId);

    if (!isValidProfessional) {
      return left(
        new ResourceNotFoundError({
          msg: 'User not found error.',
        }),
      );
    }

    const isValidClient = await this.clientsRepository.findById(clientId);
    if (!isValidClient) {
      return left(
        new ResourceNotFoundError({
          msg: 'Client not found error.',
        }),
      );
    }

    if (
      isValidClient.professionalId.toValue() !==
      isValidProfessional.id.toValue()
    ) {
      return left(
        new NotBelongsError({
          msg: 'Client does not belong to the user.',
        }),
      );
    }

    const businessServices =
      await this.businessServicesRepository.findManyByIdsAndProfessionalId(
        servicesIds,
        professionalId,
      );

    if (!businessServices || businessServices.length !== servicesIds.length) {
      return left(
        new ResourceNotFoundError({
          msg: 'Business service not found error.',
        }),
      );
    }

    const appointmentServices = businessServices.map((service, index) =>
      AppointmentService.create({
        price: service.price,
        serviceId: service.id,
        serviceName: service.name,
        duration: service.duration,
        order: index,
      }),
    );

    const servicesList = new AppointmentServiceList(appointmentServices);

    const newAppointmentOrError = Appointment.create({
      date,
      clientId: new UniqueEntityID(clientId),
      professionalId: new UniqueEntityID(professionalId),
      clientName: isValidClient.name,
      services: servicesList,
      status: AppointmentStatus[status],
    });

    if (newAppointmentOrError.isLeft()) {
      return left(newAppointmentOrError.value);
    }

    const newAppointment = newAppointmentOrError.value;
    newAppointment.markAsCreated({
      appointmentId: newAppointment.id.toValue(),
      clientId: isValidClient.id.toValue(),
      userId: newAppointment.professionalId.toValue(),
      clientPhoneNumber: isValidClient.phoneNumber,
      date: newAppointment.date,
      status: newAppointment.status,
      title: newAppointment.title,
      clientName: newAppointment.clientName,
    });
    await this.appointmentRepository.create(newAppointment);

    return right({
      appointment: newAppointment,
    });
  }
}

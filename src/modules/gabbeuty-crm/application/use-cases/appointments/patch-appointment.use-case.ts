import { Either, left, right } from '@/_shared/either';
import { InvalidDateError } from '@/_shared/errors/invalid-date-error';
import { NotBelongsError } from '@/_shared/errors/not-belongs.error';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { UserRepository } from '@/_shared/repositories/user.repository';
import {
  Appointment,
  AppointmentMustHaveAtLeastOneServiceError,
  CannotModifyCompletedAppointmentError,
} from '@/modules/gabbeuty-crm/domain/entities/appointment.entity';
import { AppointmentService } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-service';
import { AppointmentsRepository } from '@/modules/gabbeuty-crm/domain/repositories/appointments.repository';
import { BusinessServicesRepository } from '@/modules/gabbeuty-crm/domain/repositories/business-services.repository';
import { ClientsRepository } from '@/modules/gabbeuty-crm/domain/repositories/clients.repository';
import { Injectable } from '@nestjs/common';

export interface PatchAppointmentUseCaseRequest {
  appointmentId: string;
  professionalId: string;
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';
  date?: Date;
  title?: string;
  servicesIds?: string[];
}

type PatchAppointmentUseCaseResponse = Either<
  ResourceNotFoundError | InvalidDateError,
  {
    appointment: Appointment;
  }
>;

@Injectable()
export class PatchAppointmentUseCase {
  constructor(
    private userRepository: UserRepository,
    private appointmentsRepository: AppointmentsRepository,
    private businessServicesRepository: BusinessServicesRepository,
    private clientRepository: ClientsRepository,
  ) {}

  async execute({
    appointmentId,
    professionalId,
    status,
    date,
    servicesIds,
  }: PatchAppointmentUseCaseRequest): Promise<PatchAppointmentUseCaseResponse> {
    const isValidProfessional =
      await this.userRepository.findById(professionalId);

    // Validate professional
    if (!isValidProfessional) {
      return left(
        new ResourceNotFoundError({
          msg: 'User not found error.',
        }),
      );
    }

    const appointment =
      await this.appointmentsRepository.findById(appointmentId);
    // Validate appointment
    if (!appointment) {
      return left(
        new ResourceNotFoundError({
          msg: 'Appointment not found error.',
        }),
      );
    }

    const isValidClient = await this.clientRepository.findById(
      appointment.clientId.toValue(),
    );

    if (!isValidClient) {
      return left(
        new ResourceNotFoundError({
          msg: 'Appointment not found error.',
        }),
      );
    }

    // Validate owner appointment
    if (appointment.professionalId.toValue() !== professionalId) {
      return left(
        new NotBelongsError({
          msg: 'Appointment does not belong to the user.',
        }),
      );
    }

    if (status !== undefined) {
      const statusResult = appointment.updateStatus(status);
      if (statusResult.isLeft()) {
        return left(statusResult.value);
      }
    }

    if (date !== undefined) {
      const rescheduleResult = appointment.reschedule(date);
      console.log('Patch date: ', rescheduleResult.value);
      if (rescheduleResult.isLeft()) {
        return left(rescheduleResult.value);
      }
    }

    if (servicesIds !== undefined && servicesIds.length > 0) {
      const updateServicesResult = await this.replaceServices(
        appointment,
        servicesIds,
        professionalId,
      );

      if (updateServicesResult.isLeft()) {
        return left(updateServicesResult.value);
      }
    }

    const appointmentEventData = {
      appointmentId: appointment.id.toValue(),
      clientId: appointment.id.toValue(),
      userId: appointment.professionalId.toValue(),
      clientPhoneNumber: isValidClient.phoneNumber,
      date: appointment.date,
      status: appointment.status,
      title: appointment.title,
      clientName: appointment.clientName,
    };

    if (appointment.status === 'CONFIRMED') {
      appointment.markAsConfirmed(appointmentEventData);
    }

    if (appointment.status === 'CANCELED') {
      console.log('--------- canceled appointment -------------');

      appointment.markAsCanceled(appointmentEventData);
    }

    appointment.markAsPatch(appointmentEventData);
    await this.appointmentsRepository.save(appointmentId, appointment);

    return right({
      appointment,
    });
  }

  private async replaceServices(
    appointment: Appointment,
    servicesIds: string[],
    professionalId: string,
  ): Promise<
    Either<
      | CannotModifyCompletedAppointmentError
      | AppointmentMustHaveAtLeastOneServiceError
      | ResourceNotFoundError,
      void
    >
  > {
    const businessServices =
      await this.businessServicesRepository.findManyByIdsAndProfessionalId(
        servicesIds,
        professionalId,
      );

    if (!businessServices || businessServices.length !== servicesIds.length) {
      return left(
        new ResourceNotFoundError({
          msg: 'Service not found error.',
        }),
      );
    }

    const newAppointmentServices = businessServices.map((service, index) =>
      AppointmentService.create({
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        duration: service.duration,
        order: index,
      }),
    );

    const updateResult = appointment.updateServices(newAppointmentServices);

    if (updateResult.isLeft()) {
      return left(updateResult.value);
    }

    return right(undefined);
  }
}

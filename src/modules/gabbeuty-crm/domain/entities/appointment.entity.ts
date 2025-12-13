import { UniqueEntityID } from '@/_shared/value-objects/unique-entity-id.vo';
import { AppointmentStatus } from './value-objects/appointment-status.vo';
import { AppointmentServiceList } from './value-objects/appoinment-service-list';
import { AggregateRoot } from '@/_shared/event/aggregate-root';
import { Optional } from '@/_shared/types/optinal';
import { InvalidDateError } from '@/_shared/errors/invalid-date-error';
import { Either, left, right } from '@/_shared/either';
import {
  AppointmentCreatedEvent,
  AppointmentCreatedPayload,
} from '../events/appointment-created.event';
import {
  AppointmentPatchEvent,
  AppointmentPatchPayload,
} from '../events/appointment-patch.event';
import { AppointmentService } from './value-objects/appointment-service';

export class AppointmentMustHaveAtLeastOneServiceError extends Error {
  constructor() {
    super('Appointment must have at least one service');
    this.name = 'AppointmentMustHaveAtLeastOneServiceError';
  }
}

export class CannotModifyCompletedAppointmentError extends Error {
  constructor() {
    super('Cannot modify a completed or cancelled appointment');
    this.name = 'CannotModifyCompletedAppointmentError';
  }
}

export class CannotModifySameStatusError extends Error {
  constructor() {
    super('Cannot modify a same status appointment');
    this.name = 'CannotModifyCompletedAppointmentError';
  }
}

export class ServiceAlreadyAddedError extends Error {
  constructor() {
    super('Service is already added to this appointment');
    this.name = 'ServiceAlreadyAddedError';
  }
}

interface AppointmentProps {
  createdAt: Date;
  title: string;
  date: Date;
  professionalId: UniqueEntityID;
  status: AppointmentStatus;
  clientId: UniqueEntityID;
  clientName?: string;
  services: AppointmentServiceList;
}
export class Appointment extends AggregateRoot<AppointmentProps> {
  static create(
    props: Optional<AppointmentProps, 'createdAt' | 'status' | 'title'>,
    id?: string,
  ): Either<InvalidDateError, Appointment> {
    if (props.date < new Date()) {
      return left(new InvalidDateError());
    }

    if (!props.services || props.services.getItems().length === 0) {
      return left(new AppointmentMustHaveAtLeastOneServiceError());
    }

    const title =
      props.title ??
      this.generateTitleAppointment(
        props.services.getItems(),
        props.clientName ?? 'Cliente',
      );

    const newAppointment = new Appointment(
      {
        status: props.status ?? AppointmentStatus.PENDING,
        createdAt: props.createdAt ?? new Date(),
        ...props,
        title,
      },
      id,
    );

    // const isNewAppointment = !id;
    // if (isNewAppointment) {
    //   newAppointment.addDomainEvent(
    //     new AppointmentCreatedEvent(newAppointment),
    //   );
    // }

    return right(newAppointment);
  }

  static reconstitute(
    props: Optional<AppointmentProps, 'createdAt' | 'status'>,
    id?: string,
  ): Appointment {
    return new Appointment(
      {
        status: props.status ?? AppointmentStatus.PENDING,
        createdAt: props.createdAt ?? new Date(),
        ...props,
      },
      id,
    );
  }
  markAsCreated(payload: AppointmentCreatedPayload) {
    this.addDomainEvent(new AppointmentCreatedEvent(payload));
  }

  markAsPatch(payload: AppointmentPatchPayload) {
    this.addDomainEvent(new AppointmentPatchEvent(payload));
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get date() {
    return this.props.date;
  }

  get professionalId() {
    return this.props.professionalId;
  }

  get clientId() {
    return this.props.clientId;
  }

  get clientName() {
    return this.props.clientName;
  }

  get services() {
    return this.props.services;
  }

  get status() {
    return this.props.status;
  }

  get title() {
    return this.props.title;
  }

  set date(date: Date) {
    this.props.date = date;
  }

  set status(status: AppointmentStatus) {
    this.props.status = status;
  }

  set title(title: string) {
    this.props.title = title;
  }

  set clientId(clientId: UniqueEntityID) {
    this.props.clientId = clientId;
  }

  get totalPrice(): number {
    return this.props.services.getItems().reduce((sum, s) => sum + s.price, 0);
  }

  get serviceNames(): string[] {
    return this.props.services.getItems().map((s) => s.serviceName);
  }

  private canBeModified(): boolean {
    return (
      this.props.status !== AppointmentStatus.COMPLETED &&
      this.props.status !== AppointmentStatus.CANCELED
    );
  }

  updateStatus(
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED',
  ): Either<CannotModifyCompletedAppointmentError, void> {
    if (!this.canBeModified()) {
      return left(new CannotModifyCompletedAppointmentError());
    }

    switch (status) {
      case 'CONFIRMED':
        return this.confirm();

      case 'CANCELED':
        return this.cancel();

      case 'COMPLETED':
        return this.complete();

      case 'PENDING':
        return this.setPending();

      default:
        return right(undefined);
    }
  }

  reschedule(
    newDate: Date,
  ): Either<InvalidDateError | CannotModifyCompletedAppointmentError, void> {
    if (!this.canBeModified()) {
      return left(new CannotModifyCompletedAppointmentError());
    }

    if (newDate < new Date()) {
      return left(new InvalidDateError());
    }

    this.props.date = newDate;
    return right(undefined);
  }

  addService(
    service: AppointmentService,
  ): Either<
    CannotModifyCompletedAppointmentError | ServiceAlreadyAddedError,
    void
  > {
    if (!this.canBeModified()) {
      return left(new CannotModifyCompletedAppointmentError());
    }

    // ✅ Verifica duplicata via WatchedList
    if (this.props.services.hasServiceId(service.serviceId.toValue())) {
      return left(new ServiceAlreadyAddedError());
    }

    // Define ordem
    const newService = AppointmentService.create(service, service.id.toValue());

    // ✅ WatchedList rastreia automaticamente
    this.props.services.add(newService);
    this.updateTitle();

    return right(undefined);
  }

  updateServices(
    newServices: AppointmentService[],
  ): Either<
    | CannotModifyCompletedAppointmentError
    | AppointmentMustHaveAtLeastOneServiceError,
    void
  > {
    if (!this.canBeModified()) {
      return left(new CannotModifyCompletedAppointmentError());
    }

    if (newServices.length === 0) {
      return left(new AppointmentMustHaveAtLeastOneServiceError());
    }

    // ✅ WatchedList.update() calcula:
    // - getNewItems() → a inserir
    // - getRemovedItems() → a deletar
    // - getCurrentItems() → atuais
    this.props.services.update(newServices);
    this.updateTitle();

    return right(undefined);
  }

  removeService(
    serviceId: UniqueEntityID,
  ): Either<
    | CannotModifyCompletedAppointmentError
    | AppointmentMustHaveAtLeastOneServiceError
    | Error,
    void
  > {
    if (!this.canBeModified()) {
      return left(new CannotModifyCompletedAppointmentError());
    }

    // Validar se appointment ficará sem services
    if (this.props.services.getItems().length === 1) {
      return left(new AppointmentMustHaveAtLeastOneServiceError());
    }

    // Buscar o service a ser removido
    const serviceToRemove = this.props.services
      .getItems()
      .find((s) => s.serviceId.toValue() === serviceId.toValue());

    if (!serviceToRemove) {
      return left(new Error());
    }

    // ✅ WatchedList rastreia automaticamente como "removido"
    this.props.services.remove(serviceToRemove);

    // Atualizar título
    this.updateTitle();

    return right(undefined);
  }

  confirm(): Either<
    CannotModifyCompletedAppointmentError | CannotModifySameStatusError,
    void
  > {
    if (!this.canBeModified()) {
      return left(new CannotModifyCompletedAppointmentError());
    }

    if (this.props.status === AppointmentStatus.CONFIRMED) {
      return left(new CannotModifySameStatusError());
    }

    this.props.status = AppointmentStatus.CONFIRMED;
    return right(undefined);
  }

  cancel(): Either<CannotModifyCompletedAppointmentError, void> {
    if (!this.canBeModified()) {
      return left(new CannotModifyCompletedAppointmentError());
    }

    this.props.status = AppointmentStatus.CANCELED;
    return right(undefined);
  }

  complete(): Either<CannotModifyCompletedAppointmentError, void> {
    if (!this.canBeModified()) {
      return left(new CannotModifyCompletedAppointmentError());
    }

    this.props.status = AppointmentStatus.COMPLETED;
    return right(undefined);
  }

  setPending(): Either<
    CannotModifyCompletedAppointmentError | CannotModifySameStatusError,
    void
  > {
    if (!this.canBeModified()) {
      return left(new CannotModifyCompletedAppointmentError());
    }

    if (this.props.status === AppointmentStatus.PENDING) {
      return left(new CannotModifySameStatusError());
    }

    this.props.status = AppointmentStatus.PENDING;
    return right(undefined);
  }

  private static generateTitleAppointment(
    services: AppointmentService[],
    clientName: string,
  ): string {
    // Ordena services por ordem e extrai nomes
    const serviceNames = services
      .sort((a, b) => a.order - b.order)
      .map((s) => s.serviceName);

    let titleAppointment = clientName + ': ';

    if (serviceNames.length === 1) {
      titleAppointment += serviceNames[0];
    } else if (serviceNames.length === 2) {
      titleAppointment += `${serviceNames[0]} e ${serviceNames[1]}`;
    } else {
      const last = serviceNames.pop();
      titleAppointment += `${serviceNames.join(', ')} e ${last}`;
    }

    return titleAppointment;
  }

  // Método público para atualizar título quando services mudam
  private updateTitle(): void {
    this.props.title = Appointment.generateTitleAppointment(
      this.props.services.getItems(),
      this.props.clientName ?? 'Cliente',
    );
  }
}

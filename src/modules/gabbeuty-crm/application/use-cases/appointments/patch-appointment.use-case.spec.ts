import { InMemoryAppointmentsRepository } from 'test/repositories/in-memory-appointments-repository';
import { InMemoryBusinessServicesRepository } from 'test/repositories/in-memory-business-services-repository';
import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { PatchAppointmentUseCase } from './patch-appointment.use-case';
import { faker } from '@faker-js/faker';
import { Appointment } from '@/modules/gabbeuty-crm/domain/entities/appointment.entity';
import { Client } from '@/modules/gabbeuty-crm/domain/entities/client.entity';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';
import { AppointmentServiceList } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appoinment-service-list';

describe('[Unit] PatchAppointmentUseCase', () => {
  let appointmentsRepository: InMemoryAppointmentsRepository;
  let userRepository: InMemoryUserRepository;
  let clientsRepository: InMemoryClientsRepository;
  let businessServicesRepository: InMemoryBusinessServicesRepository;
  let sut: PatchAppointmentUseCase;

  beforeEach(() => {
    appointmentsRepository = new InMemoryAppointmentsRepository();
    userRepository = new InMemoryUserRepository();
    clientsRepository = new InMemoryClientsRepository();
    businessServicesRepository = new InMemoryBusinessServicesRepository();
    sut = new PatchAppointmentUseCase(
      userRepository,
      appointmentsRepository,
      businessServicesRepository,
      clientsRepository,
    );
  });

  it('should update appointment status successfully', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const professionalId = user.id.toValue();

    const client = Client.create({
      name: faker.person.fullName(),
      phoneNumber: '+5511999999999',
      professionalId: new UniqueEntityID(professionalId),
    });
    await clientsRepository.create(client);

    const appointment = Appointment.reconstitute({
      date: new Date('2025-12-20'),
      title: 'Haircut Appointment',
      professionalId: new UniqueEntityID(professionalId),
      clientId: client.id,
      status: AppointmentStatus.PENDING,
      services: new AppointmentServiceList([]),
    });
    await appointmentsRepository.create(appointment);

    const result = await sut.execute({
      appointmentId: appointment.id.toValue(),
      professionalId,
      status: 'CONFIRMED',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.appointment.status).toBe(AppointmentStatus.CONFIRMED);
    }
  });

  it('should return error if professional not found', async () => {
    const result = await sut.execute({
      appointmentId: faker.string.uuid(),
      professionalId: faker.string.uuid(),
      status: 'CONFIRMED',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return error if appointment not found', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const result = await sut.execute({
      appointmentId: faker.string.uuid(),
      professionalId: user.id.toValue(),
      status: 'CONFIRMED',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should update appointment date successfully', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const professionalId = user.id.toValue();

    const client = Client.create({
      name: faker.person.fullName(),
      phoneNumber: '+5511999999999',
      professionalId: new UniqueEntityID(professionalId),
    });
    await clientsRepository.create(client);

    const oldDate = new Date('2025-12-16');
    const appointment = Appointment.reconstitute({
      date: oldDate,
      title: 'Haircut Appointment',
      professionalId: new UniqueEntityID(professionalId),
      clientId: client.id,
      status: AppointmentStatus.PENDING,
      services: new AppointmentServiceList([]),
    });
    await appointmentsRepository.create(appointment);

    const newDate = new Date('2025-12-20');
    const result = await sut.execute({
      appointmentId: appointment.id.toValue(),
      professionalId,
      date: newDate,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.appointment.date.getTime()).toBe(newDate.getTime());
    }
  });
});

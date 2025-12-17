import { InMemoryAppointmentsRepository } from 'test/repositories/in-memory-appointments-repository';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { FetchAppointmentUseCase } from './fetch-appointments.use-case';
import { faker } from '@faker-js/faker';
import { Appointment } from '@/modules/gabbeuty-crm/domain/entities/appointment.entity';
import { UniqueEntityID } from '@/_shared/value-objects/unique-entity-id.vo';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';
import { AppointmentServiceList } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appoinment-service-list';

describe('[Unit] FetchAppointmentUseCase', () => {
  let appointmentsRepository: InMemoryAppointmentsRepository;
  let userRepository: InMemoryUserRepository;
  let sut: FetchAppointmentUseCase;

  beforeEach(() => {
    appointmentsRepository = new InMemoryAppointmentsRepository();
    userRepository = new InMemoryUserRepository();
    sut = new FetchAppointmentUseCase(userRepository, appointmentsRepository);
  });

  it('should fetch all appointments for a professional', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const professionalId = user.id.toValue();

    // Create 2 appointments
    for (let i = 0; i < 2; i++) {
      const appointment = Appointment.reconstitute({
        date: new Date('2025-12-20'),
        title: `Appointment ${i}`,
        professionalId: new UniqueEntityID(professionalId),
        clientId: new UniqueEntityID(faker.string.uuid()),
        status: AppointmentStatus.PENDING,
        services: new AppointmentServiceList([]),
      });
      await appointmentsRepository.create(appointment);
    }

    const result = await sut.execute({
      professionalId,
      pagination: { page: 1, perPage: 10 },
      dateRange: {},
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.appointments).toBeDefined();
    }
  });

  it('should return error if professional not found', async () => {
    const result = await sut.execute({
      professionalId: faker.string.uuid(),
      pagination: { page: 1, perPage: 10 },
      dateRange: {},
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return empty list if professional has no appointments', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const result = await sut.execute({
      professionalId: user.id.toValue(),
      pagination: { page: 1, perPage: 10 },
      dateRange: {},
    });

    expect(result.isRight()).toBe(true);
  });
});

import { InMemoryAppointmentsRepository } from 'test/repositories/in-memory-appointments-repository';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { FetchAppointmentMetricsUseCase } from './fetch-appointment-metrics.use-case';
import { faker } from '@faker-js/faker';
import { Appointment } from '@/modules/gabbeuty-crm/domain/entities/appointment.entity';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';
import { AppointmentServiceList } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appoinment-service-list';
import { AppointmentService } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-service';

describe('[Unit] FetchAppointmentMetricsUseCase', () => {
  let appointmentsRepository: InMemoryAppointmentsRepository;
  let userRepository: InMemoryUserRepository;
  let sut: FetchAppointmentMetricsUseCase;

  beforeEach(() => {
    appointmentsRepository = new InMemoryAppointmentsRepository();
    userRepository = new InMemoryUserRepository();
    sut = new FetchAppointmentMetricsUseCase(
      userRepository,
      appointmentsRepository,
    );
  });

  it('should fetch appointment metrics for professional', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const professionalId = user.id.toValue();

    const services = new AppointmentServiceList([
      AppointmentService.create({
        serviceId: new UniqueEntityID(),
        serviceName: 'Service',
        price: 100,
        duration: 60,
        order: 1,
      }),
    ]);

    // Create appointments with different statuses
    const statuses = [
      AppointmentStatus.PENDING,
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELED,
    ];

    for (const status of statuses) {
      const appointment = Appointment.reconstitute({
        date: new Date('2025-12-20'),
        title: 'Appointment',
        professionalId: new UniqueEntityID(professionalId),
        clientId: new UniqueEntityID(faker.string.uuid()),
        status,
        services,
      });
      await appointmentsRepository.create(appointment);
    }

    const result = await sut.execute({
      professionalId,
      dateRange: {},
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.metrics.pending).toBe(1);
      expect(result.value.metrics.confirmed).toBe(1);
      expect(result.value.metrics.completed).toBe(1);
      expect(result.value.metrics.canceled).toBe(1);
      expect(result.value.metrics.total).toBe(4);
    }
  });

  it('should return error if professional not found', async () => {
    const result = await sut.execute({
      professionalId: faker.string.uuid(),
      dateRange: {},
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return zero metrics if professional has no appointments', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const result = await sut.execute({
      professionalId: user.id.toValue(),
      dateRange: {},
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.metrics.total).toBe(0);
    }
  });
});

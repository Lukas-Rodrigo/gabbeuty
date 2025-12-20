import { InMemoryAppointmentsRepository } from 'test/repositories/in-memory-appointments-repository';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { CountAppointmentByStatusUseUseCase } from './count-status-appointment-by-status.use-case';
import { faker } from '@faker-js/faker';
import { Appointment } from '@/modules/gabbeuty-crm/domain/entities/appointment.entity';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';
import { AppointmentServiceList } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appoinment-service-list';
import { AppointmentService } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-service';

describe('[Unit] CountAppointmentByStatusUseUseCase', () => {
  let appointmentsRepository: InMemoryAppointmentsRepository;
  let userRepository: InMemoryUserRepository;
  let sut: CountAppointmentByStatusUseUseCase;

  beforeEach(() => {
    appointmentsRepository = new InMemoryAppointmentsRepository();
    userRepository = new InMemoryUserRepository();
    sut = new CountAppointmentByStatusUseUseCase(
      userRepository,
      appointmentsRepository,
    );
  });

  it('should count appointments by status for professional', async () => {
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

    // Create 3 PENDING appointments and 2 CONFIRMED
    for (let i = 0; i < 3; i++) {
      const appointment = Appointment.reconstitute({
        date: new Date('2025-12-20'),
        title: `Appointment ${i}`,
        professionalId: new UniqueEntityID(professionalId),
        clientId: new UniqueEntityID(faker.string.uuid()),
        status: AppointmentStatus.PENDING,
        services,
      });
      await appointmentsRepository.create(appointment);
    }

    for (let i = 0; i < 2; i++) {
      const appointment = Appointment.reconstitute({
        date: new Date('2025-12-20'),
        title: `Appointment Confirmed ${i}`,
        professionalId: new UniqueEntityID(professionalId),
        clientId: new UniqueEntityID(faker.string.uuid()),
        status: AppointmentStatus.CONFIRMED,
        services,
      });
      await appointmentsRepository.create(appointment);
    }

    const result = await sut.execute({
      professionalId,
      dateRange: {},
      status: AppointmentStatus.PENDING,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.total).toBe(3);
    }
  });

  it('should return error if professional not found', async () => {
    const result = await sut.execute({
      professionalId: faker.string.uuid(),
      dateRange: {},
      status: AppointmentStatus.PENDING,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return zero if no appointments match the status', async () => {
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

    // Create only PENDING appointments
    const appointment = Appointment.reconstitute({
      date: new Date('2025-12-20'),
      title: 'Appointment',
      professionalId: new UniqueEntityID(professionalId),
      clientId: new UniqueEntityID(faker.string.uuid()),
      status: AppointmentStatus.PENDING,
      services,
    });
    await appointmentsRepository.create(appointment);

    // Count COMPLETED (should be 0)
    const result = await sut.execute({
      professionalId,
      dateRange: {},
      status: AppointmentStatus.COMPLETED,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.total).toBe(0);
    }
  });

  it('should count only appointments for the specified professional', async () => {
    const user1 = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const user2 = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password456',
    );

    const services = new AppointmentServiceList([
      AppointmentService.create({
        serviceId: new UniqueEntityID(),
        serviceName: 'Service',
        price: 100,
        duration: 60,
        order: 1,
      }),
    ]);

    // Create 2 appointments for user1
    for (let i = 0; i < 2; i++) {
      const appointment = Appointment.reconstitute({
        date: new Date('2025-12-20'),
        title: `User1 Appointment ${i}`,
        professionalId: new UniqueEntityID(user1.id.toValue()),
        clientId: new UniqueEntityID(faker.string.uuid()),
        status: AppointmentStatus.PENDING,
        services,
      });
      await appointmentsRepository.create(appointment);
    }

    // Create 1 appointment for user2
    const appointment = Appointment.reconstitute({
      date: new Date('2025-12-20'),
      title: 'User2 Appointment',
      professionalId: new UniqueEntityID(user2.id.toValue()),
      clientId: new UniqueEntityID(faker.string.uuid()),
      status: AppointmentStatus.PENDING,
      services,
    });
    await appointmentsRepository.create(appointment);

    // Count only user1's appointments
    const result = await sut.execute({
      professionalId: user1.id.toValue(),
      dateRange: {},
      status: AppointmentStatus.PENDING,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.total).toBe(2);
    }
  });
});

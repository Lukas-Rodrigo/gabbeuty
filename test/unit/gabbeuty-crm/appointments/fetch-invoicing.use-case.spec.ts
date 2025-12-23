import { InMemoryAppointmentsRepository } from '@test/helpers/mocks/repositories/in-memory-appointments-repository';
import { InMemoryUserRepository } from '@test/helpers/mocks/repositories/in-memory-user-repository';
import { FetchInvoicingUseCase } from '@/modules/gabbeuty-crm/application/use-cases/appointments/fetch-invoicing.use-case';
import { faker } from '@faker-js/faker';
import { Appointment } from '@/modules/gabbeuty-crm/domain/entities/appointment.entity';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';
import { AppointmentServiceList } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appoinment-service-list';
import { AppointmentService } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-service';

describe('[Unit] FetchInvoicingUseCase', () => {
  let appointmentsRepository: InMemoryAppointmentsRepository;
  let userRepository: InMemoryUserRepository;
  let sut: FetchInvoicingUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    appointmentsRepository = new InMemoryAppointmentsRepository();
    sut = new FetchInvoicingUseCase(userRepository, appointmentsRepository);
  });

  it('should calculate total invoicing for professional', async () => {
    const user = await userRepository.create(
      faker.person.fullName(),
      faker.internet.email(),
      'password123',
    );

    const professionalId = user.id.toValue();

    // Create appointments with different prices
    const services1 = new AppointmentServiceList([
      AppointmentService.create({
        serviceId: new UniqueEntityID(),
        serviceName: 'Service 1',
        price: 100,
        duration: 60,
        order: 1,
      }),
    ]);

    const services2 = new AppointmentServiceList([
      AppointmentService.create({
        serviceId: new UniqueEntityID(),
        serviceName: 'Service 2',
        price: 150,
        duration: 60,
        order: 1,
      }),
    ]);

    const appointment1 = Appointment.reconstitute({
      date: new Date('2025-12-20'),
      title: 'Appointment 1',
      professionalId: new UniqueEntityID(professionalId),
      clientId: new UniqueEntityID(faker.string.uuid()),
      status: AppointmentStatus.COMPLETED,
      services: services1,
    });

    const appointment2 = Appointment.reconstitute({
      date: new Date('2025-12-21'),
      title: 'Appointment 2',
      professionalId: new UniqueEntityID(professionalId),
      clientId: new UniqueEntityID(faker.string.uuid()),
      status: AppointmentStatus.COMPLETED,
      services: services2,
    });

    await appointmentsRepository.create(appointment1);
    await appointmentsRepository.create(appointment2);

    const result = await sut.execute({
      professionalId,
      dateRange: {},
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.invoicing).toBe(250); // 100 + 150
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

  it('should return zero if professional has no appointments', async () => {
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
      expect(result.value.invoicing).toBe(0);
    }
  });
});

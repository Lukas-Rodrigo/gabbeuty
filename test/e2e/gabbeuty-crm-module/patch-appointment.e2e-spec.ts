import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/e2e/_helpers/mock-entities.helper';
import { randomUUID } from 'crypto';
import request from 'supertest';

describe('Patch Appointment (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let mockEntities: MockEntities;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    prisma = moduleRef.get(PrismaProvider);
    mockEntities = new MockEntities(app, prisma);
    await app.init();

    const user = await mockEntities.createUser();
    userId = user.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.plainPassword,
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await mockEntities.cleanupAll();
    await app.close();
    await prisma.$disconnect();
  });

  test('[PATCH] /appointments/:id', async () => {
    const client = await prisma.client.create({
      data: {
        name: 'Test Client',
        phoneNumber: '5511999887766',
        professionalId: userId,
      },
    });

    const service = await prisma.businessService.create({
      data: {
        name: 'Test Service',
        price: 50.0,
        professionalId: userId,
      },
    });

    await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        clientId: client.id,
        date: '2025-12-20T15:30:00.000Z',
        servicesIds: [{ id: service.id }],
      });

    const appointment = await prisma.appointment.findFirst({
      where: { clientId: client.id },
    });

    const response = await request(app.getHttpServer())
      .patch(`/appointments/${appointment!.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'CONFIRMED',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('appointment');
    expect(response.body.appointment.props.status).toBe('CONFIRMED');
  });

  test('[PATCH] /appointments/:id - should return 401 without token', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/appointments/${randomUUID()}`)
      .send({
        status: 'CONFIRMED',
      });

    expect(response.statusCode).toBe(401);
  });

  test('[PATCH] /appointments/:id - should return 404 for non-existent appointment', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/appointments/${randomUUID()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'CONFIRMED',
      });

    expect(response.statusCode).toBe(404);
  });
});

import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import { randomUUID } from 'crypto';
import request from 'supertest';
import cookieParser from 'cookie-parser';

describe('Patch Appointment (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let mockEntities: MockEntities;
  let cookies: string[];
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

    app.use(cookieParser());
    await app.init();

    const user = await mockEntities.createUser();
    userId = user.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.plainPassword,
      });

    const setCookieHeader = loginResponse.headers['set-cookie'];
    cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader].filter(Boolean);
  });

  afterAll(async () => {
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

    const date = new Date();
    date.setDate(new Date().getDate() + 3);
    await request(app.getHttpServer())
      .post('/appointments')
      .set('Cookie', cookies)
      .send({
        clientId: client.id,
        date,
        servicesIds: [{ id: service.id }],
      });

    const appointment = await prisma.appointment.findFirst({
      where: { clientId: client.id },
    });

    const response = await request(app.getHttpServer())
      .patch(`/appointments/${appointment!.id}`)
      .set('Cookie', cookies)
      .send({
        status: 'CONFIRMED',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('totalPrice');
    expect(response.body.status).toBe('CONFIRMED');
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
      .set('Cookie', cookies)
      .send({
        status: 'CONFIRMED',
      });

    expect(response.statusCode).toBe(404);
  });
});

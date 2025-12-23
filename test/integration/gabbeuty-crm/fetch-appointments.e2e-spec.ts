import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import request from 'supertest';
import cookieParser from 'cookie-parser';

describe('Fetch Appointments (E2E)', () => {
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

  test('[GET] /appointments', async () => {
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
      .set('Cookie', cookies)
      .send({
        clientId: client.id,
        date: '2025-12-25T15:30:00.000Z',
        servicesIds: [{ id: service.id }],
      });

    await request(app.getHttpServer())
      .post('/appointments')
      .set('Cookie', cookies)
      .send({
        clientId: client.id,
        date: '2025-12-26T16:00:00.000Z',
        servicesIds: [{ id: service.id }],
      });

    const response = await request(app.getHttpServer())
      .get('/appointments')
      .set('Cookie', cookies);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('appointments');
    expect(Array.isArray(response.body.appointments)).toBe(true);
    expect(response.body.appointments.length).toBeGreaterThanOrEqual(2);
  });

  test('[GET] /appointments - should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).get('/appointments');

    expect(response.statusCode).toBe(401);
  });

  test('[GET] /appointments - should support pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/appointments?page=1&perPage=1')
      .set('Cookie', cookies);

    expect(response.statusCode).toBe(200);
    expect(response.body.appointments.length).toBeLessThanOrEqual(1);
  });
});

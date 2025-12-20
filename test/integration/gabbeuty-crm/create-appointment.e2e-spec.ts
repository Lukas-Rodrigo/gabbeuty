import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import request from 'supertest';

describe('Create Appointment (E2E)', () => {
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

  test('[POST] /appointments', async () => {
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

    const response = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        clientId: client.id,
        date: '2025-12-20T15:30:00.000Z',
        servicesIds: [{ id: service.id }],
        status: 'PENDING',
      });

    expect(response.statusCode).toBe(201);
  });

  test('[POST] /appointments - should return 401 without token', async () => {
    const response = await request(app.getHttpServer())
      .post('/appointments')
      .send({
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        date: '2025-12-20T15:30:00.000Z',
        servicesIds: [{ id: '123e4567-e89b-12d3-a456-426614174001' }],
      });

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /appointments - should return 400 for missing clientId', async () => {
    const response = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        date: '2025-12-20T15:30:00.000Z',
        servicesIds: [{ id: '123e4567-e89b-12d3-a456-426614174001' }],
      });

    expect(response.statusCode).toBe(400);
  });

  test('[POST] /appointments - should return 400 for empty servicesIds', async () => {
    const response = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        date: '2025-12-20T15:30:00.000Z',
        servicesIds: [],
      });

    expect(response.statusCode).toBe(400);
  });
});

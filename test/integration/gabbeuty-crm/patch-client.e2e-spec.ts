import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import { randomUUID } from 'crypto';
import request from 'supertest';

describe('Patch Client (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let mockEntities: MockEntities;
  let accessToken: string;

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

  test('[PATCH] /clients/:id', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Client To Update',
        phoneNumber: '5511999887766',
      });

    expect(createResponse.statusCode).toBe(201);

    const client = await prisma.client.findFirst({
      where: { phoneNumber: '5511999887766' },
    });

    const response = await request(app.getHttpServer())
      .patch(`/clients/${client!.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Client Name',
        observation: 'New observation',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('client');
    expect(response.body.client.props.name).toBe('Updated Client Name');
    expect(response.body.client.props.observation).toBe('New observation');
  });

  test('[PATCH] /clients/:id - should return 401 without token', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/clients/${randomUUID()}`)
      .send({
        name: 'Updated Name',
      });

    expect(response.statusCode).toBe(401);
  });

  test('[PATCH] /clients/:id - should return 409 for non-existent client', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/clients/${randomUUID()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Name',
      });

    expect(response.statusCode).toBe(409);
  });

  test('[PATCH] /clients/:id - should return 400 for invalid phone', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Client For Invalid Update',
        phoneNumber: '5511888776655',
      });

    expect(createResponse.statusCode).toBe(201);

    const client = await prisma.client.findFirst({
      where: { phoneNumber: '5511888776655' },
    });

    const response = await request(app.getHttpServer())
      .patch(`/clients/${client!.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        phoneNumber: 'invalid',
      });

    expect(response.statusCode).toBe(400);
  });
});

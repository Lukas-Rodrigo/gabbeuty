import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/e2e/_helpers/mock-entities.helper';
import request from 'supertest';

describe('Create Client (E2E)', () => {
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

  test('[POST] /clients', async () => {
    const response = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'John Doe',
        phoneNumber: '5511999887766',
      });

    expect(response.statusCode).toBe(201);
  });

  test('[POST] /clients - should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).post('/clients').send({
      name: 'Jane Doe',
      phoneNumber: '5511999887766',
    });

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /clients - should return 400 for invalid phone', async () => {
    const response = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test User',
        phoneNumber: '123',
      });

    expect(response.statusCode).toBe(400);
  });

  test('[POST] /clients - should return 400 for missing name', async () => {
    const response = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        phoneNumber: '5511999887766',
      });

    expect(response.statusCode).toBe(400);
  });
});

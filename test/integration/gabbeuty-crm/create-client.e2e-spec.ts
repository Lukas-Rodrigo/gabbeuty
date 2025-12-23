import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import request from 'supertest';
import cookieParser from 'cookie-parser';

describe('Create Client (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let mockEntities: MockEntities;
  let cookies: string[];

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

    // 🔒 CRÍTICO: Configurar MockEntities para usar o Prisma do teste (schema test_e2e)

    app.use(cookieParser());
    await app.init();

    const user = await mockEntities.createUser();

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

  test('[POST] /clients', async () => {
    const response = await request(app.getHttpServer())
      .post('/clients')
      .set('Cookie', cookies)
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
      .set('Cookie', cookies)
      .send({
        name: 'Test User',
        phoneNumber: '123',
      });

    expect(response.statusCode).toBe(400);
  });

  test('[POST] /clients - should return 400 for missing name', async () => {
    const response = await request(app.getHttpServer())
      .post('/clients')
      .set('Cookie', cookies)
      .send({
        phoneNumber: '5511999887766',
      });

    expect(response.statusCode).toBe(400);
  });
});

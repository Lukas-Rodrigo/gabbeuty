import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '@/app.module';

describe('Login User (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let mockEntities: MockEntities;

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
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  test('[POST] /auth/login', async () => {
    const user = await mockEntities.createUser();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.plainPassword,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.headers['set-cookie']).toBeDefined();
    const cookies = Array.isArray(response.headers['set-cookie'])
      ? response.headers['set-cookie']
      : [response.headers['set-cookie']];
    expect(
      cookies.some((cookie: string) => cookie.includes('access_token')),
    ).toBe(true);
    expect(
      cookies.some((cookie: string) => cookie.includes('refresh_token')),
    ).toBe(true);
  });

  test('[POST] /auth/login - should return 404 for wrong password', async () => {
    const user = await mockEntities.createUser();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: 'wrong-password',
      });

    expect(response.statusCode).toBe(404);
  });

  test('[POST] /auth/login - should return 404 for non-existent user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: '12345678',
      });

    expect(response.statusCode).toBe(404);
  });

  test('[POST] /auth/login - should return 400 for invalid data', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'invalid-email',
        password: '',
      });

    expect(response.statusCode).toBe(400);
  });
});

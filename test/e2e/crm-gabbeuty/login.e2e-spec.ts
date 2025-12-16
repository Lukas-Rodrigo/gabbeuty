import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/e2e/helpers/mock-entities.helper';
import request from 'supertest';

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
    await app.init();
  });

  afterAll(async () => {
    await mockEntities.cleanupAll();
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
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(typeof response.body.accessToken).toBe('string');
    expect(typeof response.body.refreshToken).toBe('string');
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

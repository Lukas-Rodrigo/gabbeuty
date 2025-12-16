import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/e2e/helpers/mock-entities.helper';
import request from 'supertest';

describe('Register User (E2E)', () => {
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

  test('[POST] /auth/register', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: '12345678',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
    expect(response.body.email).toBe('john@example.com');
  });

  test('[POST] /auth/register - should return 400 for duplicate email', async () => {
    const email = 'duplicate@example.com';

    await mockEntities.createUser({ email });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Jane Doe',
        email,
        password: '12345678',
      });

    expect(response.statusCode).toBe(400);
  });

  test('[POST] /auth/register - should return 400 for invalid email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'invalid-email',
        password: '12345678',
      });

    expect(response.statusCode).toBe(400);
  });

  test('[POST] /auth/register - should return 400 for short password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      });

    expect(response.statusCode).toBe(400);
  });
});

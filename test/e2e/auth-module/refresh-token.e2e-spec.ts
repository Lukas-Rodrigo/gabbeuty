import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/e2e/_helpers/mock-entities.helper';
import request from 'supertest';

describe('Refresh Token (E2E)', () => {
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

  test('[POST] /auth/refresh', async () => {
    const user = await mockEntities.createUser();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.plainPassword,
      });

    const { refreshToken } = loginResponse.body;

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.refreshToken).not.toBe(refreshToken);
  });

  test('[POST] /auth/refresh - should return 401 for invalid token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: 'invalid-token',
      });

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /auth/refresh - should return 401 for expired token', async () => {
    const user = await mockEntities.createUser();

    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1);

    const expiredToken = await mockEntities.createRefreshToken(
      user.id,
      'expired-token',
    );

    await prisma.refreshToken.update({
      where: { id: expiredToken.id },
      data: { expiresAt: expiredDate },
    });

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: expiredToken.token,
      });

    expect(response.statusCode).toBe(401);
  });
});

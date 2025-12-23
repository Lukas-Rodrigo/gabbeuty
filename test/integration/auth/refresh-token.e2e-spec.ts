import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import request from 'supertest';
import cookieParser from 'cookie-parser';

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

    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
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

    const loginCookies = Array.isArray(loginResponse.headers['set-cookie'])
      ? loginResponse.headers['set-cookie']
      : [loginResponse.headers['set-cookie']];
    const refreshTokenCookie = loginCookies.find((cookie: string) =>
      cookie.includes('refresh_token='),
    );
    const oldRefreshToken = refreshTokenCookie
      ?.split('refresh_token=')[1]
      ?.split(';')[0];

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', loginCookies);

    expect(response.statusCode).toBe(200);
    expect(response.headers['set-cookie']).toBeDefined();
    const newCookies = Array.isArray(response.headers['set-cookie'])
      ? response.headers['set-cookie']
      : [response.headers['set-cookie']];
    const newRefreshTokenCookie = newCookies.find((cookie: string) =>
      cookie.includes('refresh_token='),
    );
    const newRefreshToken = newRefreshTokenCookie
      ?.split('refresh_token=')[1]
      ?.split(';')[0];
    expect(newRefreshToken).not.toBe(oldRefreshToken);
  });

  test('[POST] /auth/refresh - should return 401 for invalid token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', ['refresh_token=invalid-token']);

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
      .set('Cookie', [`refresh_token=${expiredToken.token}`]);

    expect(response.statusCode).toBe(401);
  });
});

import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import request from 'supertest';
import cookieParser from 'cookie-parser';

describe('Logout User (E2E)', () => {
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

  test('[POST] /auth/logout', async () => {
    const user = await mockEntities.createUser();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.plainPassword,
      });

    const cookies = Array.isArray(loginResponse.headers['set-cookie'])
      ? loginResponse.headers['set-cookie']
      : [loginResponse.headers['set-cookie']];
    const refreshTokenCookie = cookies.find((cookie: string) =>
      cookie.includes('refresh_token='),
    );
    const refreshToken = refreshTokenCookie
      ?.split('refresh_token=')[1]
      ?.split(';')[0];

    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .send({
        refreshToken,
      });

    expect(response.statusCode).toBe(204);

    const tokenInDb = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    expect(tokenInDb).toBeNull();
  });

  test('[POST] /auth/logout - should not fail for non-existent token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .send({
        refreshToken: 'non-existent-token',
      });

    expect(response.statusCode).toBe(204);
  });
});

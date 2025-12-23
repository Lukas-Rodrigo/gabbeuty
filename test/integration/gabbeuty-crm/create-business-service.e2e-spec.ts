import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import request from 'supertest';
import cookieParser from 'cookie-parser';

describe('Create Business Service (E2E)', () => {
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

  test('[POST] /business-services', async () => {
    const response = await request(app.getHttpServer())
      .post('/business-services')
      .set('Cookie', cookies)
      .send({
        name: 'Haircut Service',
        price: 50.0,
      });

    expect(response.statusCode).toBe(201);
  });

  test('[POST] /business-services - should return 401 without token', async () => {
    const response = await request(app.getHttpServer())
      .post('/business-services')
      .send({
        name: 'Haircut Service',
        price: 50.0,
      });

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /business-services - should return 400 for missing name', async () => {
    const response = await request(app.getHttpServer())
      .post('/business-services')
      .set('Cookie', cookies)
      .send({
        price: 50.0,
      });

    expect(response.statusCode).toBe(400);
  });
});

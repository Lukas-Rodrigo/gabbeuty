import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import request from 'supertest';
import cookieParser from 'cookie-parser';

describe('Fetch Clients (E2E)', () => {
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

    await request(app.getHttpServer())
      .post('/clients')
      .set('Cookie', cookies)
      .send({
        name: 'Client 1',
        phoneNumber: '5511999887766',
      });

    await request(app.getHttpServer())
      .post('/clients')
      .set('Cookie', cookies)
      .send({
        name: 'Client 2',
        phoneNumber: '5511999887767',
      });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  test('[GET] /clients', async () => {
    const response = await request(app.getHttpServer())
      .get('/clients')
      .set('Cookie', cookies);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('clients');
    expect(Array.isArray(response.body.clients)).toBe(true);
    expect(response.body.clients.length).toBeGreaterThanOrEqual(2);
  });

  test('[GET] /clients - should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).get('/clients');

    expect(response.statusCode).toBe(401);
  });

  test('[GET] /clients - should support pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/clients?page=1&perPage=1')
      .set('Cookie', cookies);

    expect(response.statusCode).toBe(200);
    expect(response.body.clients.length).toBeLessThanOrEqual(1);
  });
});

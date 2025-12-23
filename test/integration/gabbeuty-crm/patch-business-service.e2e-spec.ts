import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import { randomUUID } from 'crypto';
import request from 'supertest';
import cookieParser from 'cookie-parser';

describe('Patch Business Service (E2E)', () => {
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

  test('[PATCH] /business-services/:id', async () => {
    await request(app.getHttpServer())
      .post('/business-services')
      .set('Cookie', cookies)
      .send({
        name: 'Service To Update',
        price: 50.0,
      });

    const service = await prisma.businessService.findFirst({
      where: { name: 'Service To Update' },
    });

    const response = await request(app.getHttpServer())
      .patch(`/business-services/${service!.id}`)
      .set('Cookie', cookies)
      .send({
        name: 'Updated Service Name',
        price: 75.0,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body.name).toBe('Updated Service Name');
    expect(response.body.price).toBe(75.0);
  });

  test('[PATCH] /business-services/:id - should return 401 without token', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/business-services/${randomUUID()}`)
      .send({
        name: 'Updated Name',
      });

    expect(response.statusCode).toBe(401);
  });

  test('[PATCH] /business-services/:id - should return 404 for non-existent service', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/business-services/${randomUUID()}`)
      .set('Cookie', cookies)
      .send({
        name: 'Updated Name',
      });

    expect(response.statusCode).toBe(404);
  });
});

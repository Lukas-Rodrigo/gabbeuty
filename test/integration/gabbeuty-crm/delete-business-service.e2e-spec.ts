import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import { randomUUID } from 'crypto';
import request from 'supertest';
import cookieParser from 'cookie-parser';

describe('Delete Business Service (E2E)', () => {
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

  test('[DELETE] /business-services/:id', async () => {
    await request(app.getHttpServer())
      .post('/business-services')
      .set('Cookie', cookies)
      .send({
        name: 'Service To Delete',
        price: 50.0,
      });

    const service = await prisma.businessService.findFirst({
      where: { name: 'Service To Delete' },
    });

    const response = await request(app.getHttpServer())
      .delete(`/business-services/${service!.id}`)
      .set('Cookie', cookies);

    expect(response.statusCode).toBe(204);
  });

  test('[DELETE] /business-services/:id - should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).delete(
      `/business-services/${randomUUID()}`,
    );

    expect(response.statusCode).toBe(401);
  });

  test('[DELETE] /business-services/:id - should return 404 for non-existent service', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/business-services/${randomUUID()}`)
      .set('Cookie', cookies);

    expect(response.statusCode).toBe(404);
  });
});

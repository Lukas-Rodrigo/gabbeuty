import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import request from 'supertest';

describe('Fetch Business Services (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let mockEntities: MockEntities;
  let accessToken: string;

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

    const user = await mockEntities.createUser();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.plainPassword,
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await mockEntities.cleanupAll();
    await app.close();
    await prisma.$disconnect();
  });

  test('[GET] /business-services', async () => {
    await request(app.getHttpServer())
      .post('/business-services')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Service 1',
        price: 50.0,
      });

    await request(app.getHttpServer())
      .post('/business-services')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Service 2',
        price: 75.0,
      });

    const response = await request(app.getHttpServer())
      .get('/business-services')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('businessServices');
    expect(Array.isArray(response.body.businessServices)).toBe(true);
    expect(response.body.businessServices.length).toBeGreaterThanOrEqual(2);
  });

  test('[GET] /business-services - should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).get(
      '/business-services',
    );

    expect(response.statusCode).toBe(401);
  });

  test('[GET] /business-services - should support pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/business-services?page=1&perPage=1')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.businessServices.length).toBeLessThanOrEqual(1);
  });
});

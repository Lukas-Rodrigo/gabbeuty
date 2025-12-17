import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/e2e/_helpers/mock-entities.helper';
import { randomUUID } from 'crypto';
import request from 'supertest';

describe('Patch Business Service (E2E)', () => {
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

  test('[PATCH] /business-services/:id', async () => {
    await request(app.getHttpServer())
      .post('/business-services')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Service To Update',
        price: 50.0,
      });

    const service = await prisma.businessService.findFirst({
      where: { name: 'Service To Update' },
    });

    const response = await request(app.getHttpServer())
      .patch(`/business-services/${service!.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Service Name',
        price: 75.0,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('service');
    expect(response.body.service.props.name).toBe('Updated Service Name');
    expect(response.body.service.props.price).toBe(75.0);
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
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Name',
      });

    expect(response.statusCode).toBe(404);
  });
});

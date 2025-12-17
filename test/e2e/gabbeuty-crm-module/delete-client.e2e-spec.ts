import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/e2e/_helpers/mock-entities.helper';
import { randomUUID } from 'crypto';
import request from 'supertest';

describe('Delete Client (E2E)', () => {
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

  test('[DELETE] /clients/:id', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Client To Delete',
        phoneNumber: '5511999887766',
      });

    expect(createResponse.statusCode).toBe(201);

    const client = await prisma.client.findFirst({
      where: { phoneNumber: '5511999887766' },
    });

    const response = await request(app.getHttpServer())
      .delete(`/clients/${client!.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(204);
  });

  test('[DELETE] /clients/:id - should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).delete(
      `/clients/${randomUUID()}`,
    );

    expect(response.statusCode).toBe(401);
  });

  test('[DELETE] /clients/:id - should return 404 for non-existent client', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/clients/${randomUUID()}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });
});

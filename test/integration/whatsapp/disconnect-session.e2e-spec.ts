import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import request from 'supertest';

describe('Disconnect WhatsApp Session (E2E)', () => {
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

  test('[POST] /whatsapp/disconnect', async () => {
    const response = await request(app.getHttpServer())
      .post('/whatsapp/disconnect')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect([200, 404]).toContain(response.statusCode);
    if (response.statusCode === 200) {
      expect(response.body).toHaveProperty('success');
    }
  });

  test('[POST] /whatsapp/disconnect - should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).post(
      '/whatsapp/disconnect',
    );

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /whatsapp/disconnect - should return 401 with invalid token', async () => {
    const response = await request(app.getHttpServer())
      .post('/whatsapp/disconnect')
      .set('Authorization', 'Bearer invalid-token')
      .send();

    expect(response.statusCode).toBe(401);
  });
});

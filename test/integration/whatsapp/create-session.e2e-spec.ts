import { AppModule } from '@/app.module';
import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/helpers/utils/mock-entities.helper';
import request from 'supertest';
import cookieParser from 'cookie-parser';

describe('Create WhatsApp Session (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaProvider;
  let mockEntities: MockEntities;
  let cookies: string[];
  let userId: string;

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
    userId = user.id;

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

  test('[POST] /whatsapp', async () => {
    const response = await request(app.getHttpServer())
      .post('/whatsapp')
      .set('Cookie', cookies)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('sessionId');
    expect(response.body).toHaveProperty('userId');
    expect(response.body.userId).toBe(userId);
    expect(typeof response.body.sessionId).toBe('string');
  });

  test('[POST] /whatsapp - should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).post('/whatsapp');

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /whatsapp - should return 401 with invalid token', async () => {
    const response = await request(app.getHttpServer())
      .post('/whatsapp')
      .set('Cookie', ['invalid-cookie'])
      .send();

    expect(response.statusCode).toBe(401);
  });
});

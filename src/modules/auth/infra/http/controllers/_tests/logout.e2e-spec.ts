import { AppModule } from '@/app.module';
import { PrismaService } from '@/modules/auth/infra/database/prisma.provider';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockEntities } from '@test/e2e/helpers/mock-entities.helper';
import request from 'supertest';

describe('Logout User (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
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

    prisma = moduleRef.get(PrismaService);
    mockEntities = new MockEntities(app, prisma);
    await app.init();
  });

  afterAll(async () => {
    await mockEntities.cleanupAll();
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

    const { refreshToken } = loginResponse.body;

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

import { INestApplication } from '@nestjs/common';
import { hash } from 'bcrypt';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';
import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';

export class MockEntities {
  constructor(
    private app: INestApplication,
    private prisma: PrismaProvider,
  ) {}

  async createUser(data?: {
    email?: string;
    password?: string;
    name?: string;
  }) {
    const passwordHash = await hash(data?.password || '12345678', 10);

    const user = await this.prisma.user.create({
      data: {
        id: randomUUID(),
        email: data?.email || faker.internet.email(),
        name: data?.name || faker.person.fullName(),
        passwordHash,
        createdAt: new Date(),
      },
    });

    return {
      ...user,
      plainPassword: data?.password || '12345678',
    };
  }

  async createRefreshToken(userId: string, token?: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.prisma.refreshToken.create({
      data: {
        id: randomUUID(),
        userId,
        token: token || faker.string.alphanumeric(32),
        expiresAt,
        createdAt: new Date(),
      },
    });
  }
}

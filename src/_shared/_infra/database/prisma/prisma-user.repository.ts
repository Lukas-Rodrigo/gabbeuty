import { Injectable } from '@nestjs/common';
import { User } from '@/modules/auth/domain/entities/user.entity';
import { UserRepository } from '@/_shared/repositories/user.repository';
import { randomUUID } from 'crypto';
import { PrismaUserMapper } from './mapper/prisma-user.mapper';
import { PrismaProvider } from './prisma.provider';

@Injectable()
export class PrismaUsersRepository implements UserRepository {
  constructor(private prismaService: PrismaProvider) {}
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return PrismaUserMapper.toDomain(user);
  }

  async create(
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<User> {
    const user = await this.prismaService.user.create({
      data: {
        id: randomUUID(),
        name,
        email,
        passwordHash,
        createdAt: new Date(),
      },
    });

    return PrismaUserMapper.toDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return PrismaUserMapper.toDomain(user);
  }
}

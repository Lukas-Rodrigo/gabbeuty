import { Prisma } from '@prisma/client';
import { User as UserPrisma } from '@prisma/client';
import { User } from '@/modules/auth/domain/entities/user.entity';

export class PrismaUserMapper {
  static toDomain(row: Prisma.UserUncheckedCreateInput): User {
    return User.create(
      {
        email: row.email,
        name: row.name,
        password: row.passwordHash,
      },
      row.id,
    );
  }

  static toPrisma(row: User): UserPrisma {
    return {
      id: row.id.toValue(),
      email: row.email,
      name: row.name,
      passwordHash: row.password,
      createdAt: row.createdAt,
    };
  }
}

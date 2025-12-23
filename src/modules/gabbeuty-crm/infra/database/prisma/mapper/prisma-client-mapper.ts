import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';
import { Client } from '@/modules/gabbeuty-crm/domain/entities/client.entity';
import { Client as PrismaClient } from '@prisma/client';

export class PrismaClientMapper {
  static toDomain(raw: PrismaClient): Client {
    return Client.create(
      {
        name: raw.name,
        phoneNumber: raw.phoneNumber,
        professionalId: new UniqueEntityID(raw.professionalId),
        observation: raw.observation,
        profileUrl: raw.profileUrl,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt ?? undefined,
      },
      raw.id,
    );
  }

  static toPrisma(raw: Client): PrismaClient {
    return {
      id: raw.id.toValue(),
      name: raw.name,
      phoneNumber: raw.phoneNumber,
      professionalId: raw.professionalId.toValue(),
      observation: raw.observation ?? null,
      profileUrl: raw.profileUrl ?? null,
      createdAt: raw.createdAt,
      deletedAt: raw.deletedAt ?? null,
    };
  }
}

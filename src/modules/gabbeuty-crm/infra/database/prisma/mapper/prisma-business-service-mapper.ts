import { UniqueEntityID } from '@/_shared/value-objects/unique-entity-id.vo';
import { BusinessService } from '@/modules/gabbeuty-crm/domain/entities/business-service.entity';
import {
  Prisma,
  BusinessService as PrismaBusinessService,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

export class PrismaBusinessServiceMapper {
  static toDomain(
    raw: Prisma.BusinessServiceUncheckedCreateInput,
  ): BusinessService {
    return BusinessService.create(
      {
        name: raw.name,
        price: Number(raw.price),
        duration: Number(raw.duration ?? 60),
        professionalId: new UniqueEntityID(raw.professionalId),
        deletedAt: raw.deletedAt ? new Date(raw.deletedAt) : undefined,
      },
      raw.id,
    );
  }

  static toPrisma(raw: BusinessService): PrismaBusinessService {
    return {
      id: raw.id.toValue(),
      price: Decimal(raw.price),
      name: raw.name,
      duration: raw.duration,
      professionalId: raw.professionalId.toValue(),
      createdAt: raw.createdAt,
      deletedAt: raw.deletedAt ?? null,
    };
  }
}

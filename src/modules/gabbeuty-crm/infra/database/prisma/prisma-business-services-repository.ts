import { DateRange } from '@/_shared/entities/date-range';
import { PaginationParam } from '@/_shared/entities/pagination-param';
import { PrismaProvider } from '@/infra/database/prisma/prisma.provider';
import { BusinessService } from '@/modules/gabbeuty-crm/domain/entities/business-service.entity';
import { BusinessServicesRepository } from '@/modules/gabbeuty-crm/domain/repositories/business-services.repository';
import { Injectable } from '@nestjs/common';
import { PrismaBusinessServiceMapper } from './mapper/prisma-business-service-mapper';

@Injectable()
export class PrismaBusinessServiceRepository implements BusinessServicesRepository {
  constructor(private prismaService: PrismaProvider) {}
  async save(id: string, businessService: BusinessService): Promise<void> {
    const updateBusinessService =
      PrismaBusinessServiceMapper.toPrisma(businessService);
    await this.prismaService.businessService.update({
      where: {
        id,
      },
      data: {
        ...updateBusinessService,
      },
    });
  }

  async create(businessService: BusinessService): Promise<void> {
    const newBusinessService =
      PrismaBusinessServiceMapper.toPrisma(businessService);

    await this.prismaService.businessService.create({
      data: newBusinessService,
    });
  }
  async findById(businessServiceId: string): Promise<BusinessService | null> {
    const businessServiceFound =
      await this.prismaService.businessService.findUnique({
        where: {
          id: businessServiceId,
        },
      });

    if (!businessServiceFound) {
      return null;
    }
    return PrismaBusinessServiceMapper.toDomain(businessServiceFound);
  }

  async findByProfessionalId(
    professionalId: string,
    { page, perPage }: PaginationParam,
    { startDate, endDate }: DateRange,
  ): Promise<BusinessService[]> {
    const businessServices = await this.prismaService.businessService.findMany({
      where: {
        professionalId: professionalId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
      },
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: { createdAt: 'desc' },
    });

    return businessServices.map(PrismaBusinessServiceMapper.toDomain);
  }

  async findManyByIdsAndProfessionalId(
    businessServicesIds: string[],
    professionalId: string,
  ): Promise<BusinessService[] | null> {
    const businessServicesFound =
      await this.prismaService.businessService.findMany({
        where: {
          id: {
            in: businessServicesIds,
          },
          professionalId,
        },
      });

    if (businessServicesFound.length !== businessServicesIds.length) {
      return null;
    }

    return businessServicesFound.map((service) =>
      PrismaBusinessServiceMapper.toDomain(service),
    );
  }
}

import { DateRange } from '@/_shared/entities/date-range';
import { PaginationParam } from '@/_shared/entities/pagination-param';
import { Client } from '@/modules/gabbeuty-crm/domain/entities/client.entity';
import { ClientsRepository } from '@/modules/gabbeuty-crm/domain/repositories/clients.repository';
import { Injectable } from '@nestjs/common';
import { PrismaClientMapper } from './mapper/prisma-client-mapper';
import { PrismaProvider } from '@/_shared/_infra/database/prisma/prisma.provider';
@Injectable()
export class PrismaClientsRepository implements ClientsRepository {
  constructor(private prismaService: PrismaProvider) {}

  async save(clientId: string, updateClient: Client): Promise<void> {
    const data = PrismaClientMapper.toPrisma(updateClient);
    await this.prismaService.client.update({
      where: {
        id: clientId,
      },
      data,
    });
  }

  async create(client: Client): Promise<void> {
    const newClient = PrismaClientMapper.toPrisma(client);

    await this.prismaService.client.create({
      data: newClient,
    });
  }

  async delete(clientId: string): Promise<void> {
    await this.prismaService.client.update({
      where: {
        id: clientId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Client | null> {
    const clientFound = await this.prismaService.client.findFirst({
      where: {
        phoneNumber: phoneNumber,
      },
    });

    if (!clientFound) {
      return null;
    }

    return PrismaClientMapper.toDomain(clientFound);
  }

  async findById(clientId: string): Promise<Client | null> {
    const clientFound = await this.prismaService.client.findUnique({
      where: {
        id: clientId,
        deletedAt: null,
      },
    });

    if (!clientFound) {
      return null;
    }

    return PrismaClientMapper.toDomain(clientFound);
  }

  async findByProfessionalId(
    professionalId: string,
    { startDate, endDate }: DateRange,
    { page, perPage }: PaginationParam,
  ): Promise<Client[]> {
    const clients = await this.prismaService.client.findMany({
      where: {
        professionalId,
        deletedAt: null,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      take: perPage,
      skip: (page - 1) * perPage,
    });
    return clients.map(PrismaClientMapper.toDomain);
  }
}

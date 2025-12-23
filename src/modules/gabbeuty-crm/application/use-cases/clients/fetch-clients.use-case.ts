import { Either, left, right } from '@/_shared/either';
import { DateRange } from '@/_shared/entities/date-range';
import { PaginationParam } from '@/_shared/entities/pagination-param';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { UserRepository } from '@/_shared/repositories/user.repository';
import { Client } from '@/modules/gabbeuty-crm/domain/entities/client.entity';
import { ClientsRepository } from '@/modules/gabbeuty-crm/domain/repositories/clients.repository';
import { Injectable } from '@nestjs/common';

export interface FetchClientsUseCaseRequest {
  professionalId: string;
  dateRange: DateRange;
  pagination: PaginationParam;
}

type FetchClientsUseCaseResponse = Either<
  Error,
  {
    clients: Client[];
  }
>;

@Injectable()
export class FetchClientsUseCase {
  constructor(
    private userRepository: UserRepository,
    private clientsRepository: ClientsRepository,
  ) {}

  async handle({
    professionalId,
    dateRange,
    pagination,
  }: FetchClientsUseCaseRequest): Promise<FetchClientsUseCaseResponse> {
    const isValidProfessional =
      await this.userRepository.findById(professionalId);

    if (!isValidProfessional) {
      return left(
        new ResourceNotFoundError({ msg: 'Professional not found.' }),
      );
    }

    const clients = await this.clientsRepository.fetchByProfessionalId(
      professionalId,
      dateRange,
      pagination,
    );

    return right({
      clients,
    });
  }
}

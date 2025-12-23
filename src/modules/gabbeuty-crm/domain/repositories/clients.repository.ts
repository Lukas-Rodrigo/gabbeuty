import { DateRange } from '@/_shared/entities/date-range';
import { PaginationParam } from '@/_shared/entities/pagination-param';
import { Client } from '../entities/client.entity';

export abstract class ClientsRepository {
  abstract create(client: Client): Promise<Client>;
  abstract delete(clientId: string): Promise<void>;
  abstract save(clientId: string, updateClient: Client): Promise<Client>;
  abstract findByPhoneNumber(phoneNumber: string): Promise<Client | null>;
  abstract findById(clientId: string): Promise<Client | null>;

  abstract fetchByProfessionalId(
    professionalId: string,
    dateRange: DateRange,
    Pagination: PaginationParam,
  ): Promise<Client[]>;
}

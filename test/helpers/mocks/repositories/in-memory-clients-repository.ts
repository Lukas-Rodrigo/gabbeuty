import { DateRange } from '@/_shared/entities/date-range';
import { PaginationParam } from '@/_shared/entities/pagination-param';
import { Client } from '@/modules/gabbeuty-crm/domain/entities/client.entity';
import { ClientsRepository } from '@/modules/gabbeuty-crm/domain/repositories/clients.repository';

export class InMemoryClientsRepository implements ClientsRepository {
  public clients: Client[] = [];

  async create(client: Client): Promise<void> {
    this.clients.push(client);
  }

  async delete(clientId: string): Promise<void> {
    const index = this.clients.findIndex(
      (client) => client.id.toValue() === clientId,
    );
    if (index !== -1) {
      this.clients.splice(index, 1);
    }
  }

  async save(clientId: string, updateClient: Client): Promise<void> {
    const index = this.clients.findIndex(
      (client) => client.id.toValue() === clientId,
    );
    if (index !== -1) {
      this.clients[index] = updateClient;
    }
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Client | null> {
    const client = this.clients.find(
      (client) => client.phoneNumber === phoneNumber,
    );
    return client || null;
  }

  async findById(clientId: string): Promise<Client | null> {
    const client = this.clients.find(
      (client) => client.id.toValue() === clientId,
    );
    return client || null;
  }

  async fetchByProfessionalId(
    professionalId: string,
    dateRange: DateRange,
    pagination: PaginationParam,
  ): Promise<Client[]> {
    const filtered = this.clients.filter(
      (client) => client.professionalId.toValue() === professionalId,
    );

    const start = (pagination.page - 1) * pagination.perPage;
    const end = start + pagination.perPage;

    return filtered.slice(start, end);
  }
}

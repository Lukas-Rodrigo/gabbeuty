import { DateRange } from '@/_shared/entities/date-range';
import { PaginationParam } from '@/_shared/entities/pagination-param';
import { Client } from '@/modules/gabbeuty-crm/domain/entities/client.entity';

export class ClientPresenter {
  static toHTTP(client: Client) {
    return {
      id: client.id.toValue(),
      name: client.name,
      phoneNumber: client.phoneNumber,
      profileUrl: client.profileUrl,
      observation: client.observation,
      createdAt: client.createdAt,
      deletedAt: client.deletedAt,
    };
  }

  static toFetchHTTP({
    clients,
    dateRange,
    pagination,
  }: {
    clients: Client[];
    dateRange: DateRange;
    pagination: PaginationParam;
  }) {
    const { startDate, endDate } = dateRange;
    const { perPage, page } = pagination;
    return {
      clients: clients.map((client) => this.toHTTP(client)),
      page,
      perPage,
      total: clients.length,
      filters: {
        startDate,
        endDate,
      },
    };
  }
}

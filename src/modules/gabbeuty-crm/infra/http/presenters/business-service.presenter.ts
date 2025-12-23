import { DateRange } from '@/_shared/entities/date-range';
import { PaginationParam } from '@/_shared/entities/pagination-param';
import { BusinessService } from '@/modules/gabbeuty-crm/domain/entities/business-service.entity';

export class BusinessServicePresenter {
  static toHTTP(service: BusinessService) {
    return {
      id: service.id.toValue(),
      name: service.name,
      price: service.price,
      createdAt: service.createdAt,
      deletedAt: service.deletedAt,
    };
  }

  static toFetchHTTP({
    businessServices,
    dateRange,
    pagination,
  }: {
    businessServices: BusinessService[];
    dateRange: DateRange;
    pagination: PaginationParam;
  }) {
    const { startDate, endDate } = dateRange;
    const { page, perPage } = pagination;
    return {
      businessServices: businessServices.map((services) =>
        this.toHTTP(services),
      ),
      page,
      perPage,
      total: BusinessService.length,
      filters: {
        startDate,
        endDate,
      },
    };
  }
}

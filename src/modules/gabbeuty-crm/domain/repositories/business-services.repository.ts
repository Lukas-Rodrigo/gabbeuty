import { DateRange } from '@/_shared/entities/date-range';
import { PaginationParam } from '@/_shared/entities/pagination-param';
import { BusinessService } from '../entities/business-service.entity';

export abstract class BusinessServicesRepository {
  abstract create(businessService: BusinessService): Promise<BusinessService>;
  abstract save(id: string, businessService: BusinessService): Promise<void>;
  abstract findById(businessServiceId: string): Promise<BusinessService | null>;
  abstract findManyByIdsAndProfessionalId(
    businessServicesIds: string[],
    professionalId: string,
  ): Promise<BusinessService[] | null>;

  abstract findByProfessionalId(
    professionalId: string,
    pagination: PaginationParam,
    dateRange: DateRange,
  ): Promise<BusinessService[]>;
}

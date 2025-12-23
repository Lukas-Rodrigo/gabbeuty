import { PaginationParam } from '@/_shared/entities/pagination-param';
import { BusinessService } from '@/modules/gabbeuty-crm/domain/entities/business-service.entity';
import { BusinessServicesRepository } from '@/modules/gabbeuty-crm/domain/repositories/business-services.repository';

export class InMemoryBusinessServicesRepository implements BusinessServicesRepository {
  public businessServices: BusinessService[] = [];

  async create(businessService: BusinessService): Promise<BusinessService> {
    this.businessServices.push(businessService);
    return businessService;
  }

  async save(id: string, businessService: BusinessService): Promise<void> {
    const index = this.businessServices.findIndex(
      (service) => service.id.toValue() === id,
    );
    if (index !== -1) {
      this.businessServices[index] = businessService;
    }
  }

  async findById(businessServiceId: string): Promise<BusinessService | null> {
    const service = this.businessServices.find(
      (service) => service.id.toValue() === businessServiceId,
    );
    return service || null;
  }

  async findManyByIdsAndProfessionalId(
    businessServicesIds: string[],
    professionalId: string,
  ): Promise<BusinessService[] | null> {
    const services = this.businessServices.filter(
      (service) =>
        businessServicesIds.includes(service.id.toValue()) &&
        service.professionalId.toValue() === professionalId,
    );
    return services.length > 0 ? services : null;
  }

  async findByProfessionalId(
    professionalId: string,
    pagination: PaginationParam,
  ): Promise<BusinessService[]> {
    const filtered = this.businessServices.filter(
      (service) => service.professionalId.toValue() === professionalId,
    );

    const start = (pagination.page - 1) * pagination.perPage;
    const end = start + pagination.perPage;
    return filtered.slice(start, end);
  }
}

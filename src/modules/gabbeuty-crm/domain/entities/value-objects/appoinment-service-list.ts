import { WatchedList } from '@/_shared/event/watched-list';
import { AppointmentService } from './appointment-service';

export class AppointmentServiceList extends WatchedList<AppointmentService> {
  compareItems(a: AppointmentService, b: AppointmentService): boolean {
    return a.id.toValue() === b.id.toValue();
  }
  compareByServiceId(a: AppointmentService, b: AppointmentService): boolean {
    return a.serviceId.toValue() === b.serviceId.toValue();
  }

  hasServiceId(serviceId: string): boolean {
    return this.currentItems.some(
      (item) => item.serviceId.toValue() === serviceId,
    );
  }
}

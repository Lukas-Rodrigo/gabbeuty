import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';

export class AppointmentStatusMapper {
  static toPortuguese(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'Pendente';

      case AppointmentStatus.CONFIRMED:
        return 'Confirmado';

      case AppointmentStatus.COMPLETED:
        return 'Concluído';

      case AppointmentStatus.CANCELED:
        return 'Cancelado';

      default:
        return status;
    }
  }
}

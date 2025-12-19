import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';
import { AppointmentStatusMapper } from '../mappers/appointment-status.mapper';

export interface AppointmentData {
  title: string;
  date: Date;
  status: AppointmentStatus;
  clientName?: string;
  professionalName?: string;
  location?: string;
}

export class AppointmentTemplate {
  static getByStatus(data: AppointmentData): string {
    switch (data.status) {
      case AppointmentStatus.PENDING:
        return this.pending(data);

      case AppointmentStatus.CONFIRMED:
        return this.confirmation(data);

      case AppointmentStatus.COMPLETED:
        return this.completed(data);

      case AppointmentStatus.CANCELED:
        return this.cancellation(data);

      default:
        return this.pending(data);
    }
  }

  /**
   * Template para confirmação de agendamento
   */
  static confirmation(data: AppointmentData): string {
    const { dateFormatted, timeFormatted } = this.formatDateTime(data.date);
    const statusText = AppointmentStatusMapper.toPortuguese(data.status);

    return `┏━━━━━━━━━━━━━━━━━━━━┓
┃  ✅ *AGENDAMENTO CONFIRMADO*  ┃
┗━━━━━━━━━━━━━━━━━━━━┛

ℹ️ *Informações:*
${data.title}

📅 *Data:*
${dateFormatted}

🕐 *Horário:*
${timeFormatted}

📊 *Status:*
${statusText}

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

🔔 _Você receberá um lembrete próximo ao horário_`;
  }

  /**
   * Template para mudança de status
   */
  static statusChange(
    data: AppointmentData,
    previousStatus: AppointmentStatus,
  ): string {
    const { dateFormatted, timeFormatted } = this.formatDateTime(data.date);
    const oldStatusText = AppointmentStatusMapper.toPortuguese(previousStatus);
    const newStatusText = AppointmentStatusMapper.toPortuguese(data.status);

    const icon = this.getStatusIcon(data.status);
    const header = this.getStatusHeader(data.status);

    return `┏━━━━━━━━━━━━━━━━━━━━┓
┃  ${icon} *${header}*  ┃
┗━━━━━━━━━━━━━━━━━━━━┛

ℹ️ *Informações:*
${data.title}

📅 *Data:*
${dateFormatted}

🕐 *Horário:*
${timeFormatted}

📊 *Status Anterior:*
${oldStatusText}

📊 *Novo Status:*
${newStatusText}

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

${this.getStatusFooter(data.status)}`;
  }

  /**
   * Template para lembrete de agendamento
   */
  static reminder(data: AppointmentData, minutesUntil: number): string {
    const { dateFormatted, timeFormatted } = this.formatDateTime(data.date);
    const timeText = this.formatTimeUntil(minutesUntil);

    return `┏━━━━━━━━━━━━━━━━━━━━┓
┃  🔔 *LEMBRETE DE AGENDAMENTO*  ┃
┗━━━━━━━━━━━━━━━━━━━━┛

⏰ *Seu agendamento está próximo!*
${timeText}

ℹ️ *Informações:*
${data.title}

📅 *Data:*
${dateFormatted}

🕐 *Horário:*
${timeFormatted}

${data.location ? `📍 *Local:*\n${data.location}\n\n` : ''}┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

💡 _Esteja pronto alguns minutos antes_`;
  }

  /**
   * Template para cancelamento
   */
  static cancellation(data: AppointmentData, reason?: string): string {
    const { dateFormatted, timeFormatted } = this.formatDateTime(data.date);

    return `┏━━━━━━━━━━━━━━━━━━━━┓
┃  ❌ *AGENDAMENTO CANCELADO*  ┃
┗━━━━━━━━━━━━━━━━━━━━┛

ℹ️ *Informações:*
${data.title}

📅 *Data:*
${dateFormatted}

🕐 *Horário:*
${timeFormatted}

${reason ? `📝 *Motivo:*\n${reason}\n\n` : ''}┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

📞 _Entre em contato para reagendar_`;
  }

  /**
   * Template para agendamento pendente
   */
  static pending(data: AppointmentData): string {
    const { dateFormatted, timeFormatted } = this.formatDateTime(data.date);

    return `┏━━━━━━━━━━━━━━━━━━━━┓
┃  ⏳ *AGENDAMENTO PENDENTE*  ┃
┗━━━━━━━━━━━━━━━━━━━━┛

ℹ️ *Informações:*
${data.title}

📅 *Data:*
${dateFormatted}

🕐 *Horário:*
${timeFormatted}

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚠️ _Aguardando confirmação_
📱 _Você será notificado quando for confirmado_`;
  }

  /**
   * Template para agendamento completo
   */
  static completed(data: AppointmentData): string {
    const { dateFormatted, timeFormatted } = this.formatDateTime(data.date);

    return `┏━━━━━━━━━━━━━━━━━━━━┓
┃  ✨ *AGENDAMENTO CONCLUÍDO*  ┃
┗━━━━━━━━━━━━━━━━━━━━┛

ℹ️ *Informações:*
${data.title}

📅 *Data:*
${dateFormatted}

🕐 *Horário:*
${timeFormatted}

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

🙏 _Obrigado por comparecer!_
⭐ _Sua avaliação é muito importante para nós_`;
  }

  // ===== Métodos auxiliares privados =====

  private static formatDateTime(date: Date): {
    dateFormatted: string;
    timeFormatted: string;
  } {
    const appointmentDate = new Date(date);

    const timeZone = 'America/Sao_Paulo';

    const dateFormatted = appointmentDate.toLocaleDateString('pt-BR', {
      timeZone,
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const timeFormatted = appointmentDate.toLocaleTimeString('pt-BR', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
    });

    return { dateFormatted, timeFormatted };
  }

  private static formatTimeUntil(minutes: number): string {
    if (minutes < 60) {
      return `Faltam ${minutes} minutos`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `Falta${hours > 1 ? 'm' : ''} ${hours} hora${hours > 1 ? 's' : ''}`;
    }

    return `Faltam ${hours}h${remainingMinutes}min`;
  }

  private static getStatusIcon(status: AppointmentStatus): string {
    const icons = {
      [AppointmentStatus.PENDING]: '⏳',
      [AppointmentStatus.CONFIRMED]: '✅',
      [AppointmentStatus.COMPLETED]: '✨',
      [AppointmentStatus.CANCELED]: '❌',
    };

    return icons[status] || '📋';
  }

  private static getStatusHeader(status: AppointmentStatus): string {
    const headers = {
      [AppointmentStatus.PENDING]: 'STATUS ALTERADO',
      [AppointmentStatus.CONFIRMED]: 'AGENDAMENTO CONFIRMADO',
      [AppointmentStatus.COMPLETED]: 'AGENDAMENTO CONCLUÍDO',
      [AppointmentStatus.CANCELED]: 'AGENDAMENTO CANCELADO',
    };

    return headers[status] || 'STATUS ATUALIZADO';
  }

  private static getStatusFooter(status: AppointmentStatus): string {
    const footers = {
      [AppointmentStatus.PENDING]: '⚠️ _Aguardando confirmação_',
      [AppointmentStatus.CONFIRMED]:
        '🔔 _Você receberá um lembrete próximo ao horário_',
      [AppointmentStatus.COMPLETED]: '🙏 _Obrigado por comparecer!_',
      [AppointmentStatus.CANCELED]: '📞 _Entre em contato para reagendar_',
    };

    return footers[status] || '';
  }
}

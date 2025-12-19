export interface ReminderData {
  clientName: string;
  appointmentTitle: string;
  date: Date;
  location?: string;
  professionalName?: string;
  instructions?: string;
}

export class ReminderTemplate {
  /**
   * Lembrete 24 horas antes
   */
  static oneDayBefore(data: ReminderData): string {
    const { dateFormatted, timeFormatted } = this.formatDateTime(data.date);

    return `┏━━━━━━━━━━━━━━━━━━━━┓
┃  📅 *LEMBRETE - AMANHÃ*  ┃
┗━━━━━━━━━━━━━━━━━━━━┛

Olá, *${data.clientName}*! 👋

⏰ *Lembrete:* Seu agendamento é amanhã!

ℹ️ *Serviço:*
${data.appointmentTitle}

📅 *Data:*
${dateFormatted}

🕐 *Horário:*
${timeFormatted}

${data.professionalName ? `👤 *Profissional:*\n${data.professionalName}\n\n` : ''}${data.location ? `📍 *Local:*\n${data.location}\n\n` : ''}${data.instructions ? `📋 *Observações:*\n${data.instructions}\n\n` : ''}┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

✅ _Confirme sua presença respondendo esta mensagem_
❌ _Caso precise cancelar, avise com antecedência_`;
  }

  /**
   * Lembrete 1 hora antes
   */
  static oneHourBefore(data: ReminderData): string {
    const { timeFormatted } = this.formatDateTime(data.date);

    return `┏━━━━━━━━━━━━━━━━━━━━┓
┃  ⏰ *LEMBRETE - 1 HORA*  ┃
┗━━━━━━━━━━━━━━━━━━━━┛

Olá, *${data.clientName}*! 👋

🚨 *Seu agendamento é daqui a 1 hora!*

ℹ️ *Serviço:*
${data.appointmentTitle}

🕐 *Horário:*
${timeFormatted}

${data.location ? `📍 *Local:*\n${data.location}\n\n` : ''}┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⏱️ _Não se atrase!_
🚗 _Considere o tempo de deslocamento_`;
  }

  /**
   * Lembrete 30 minutos antes
   */
  static thirtyMinutesBefore(data: ReminderData): string {
    const { timeFormatted } = this.formatDateTime(data.date);

    return `┏━━━━━━━━━━━━━━━━━━━━┓
┃  🔔 *ÚLTIMO LEMBRETE*  ┃
┗━━━━━━━━━━━━━━━━━━━━┛

*${data.clientName}*, faltam 30 minutos! ⏰

ℹ️ *Serviço:*
${data.appointmentTitle}

🕐 *Horário:*
${timeFormatted}

${data.location ? `📍 *Local:*\n${data.location}\n\n` : ''}┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

🏃 _Já está a caminho?_
📱 _Estamos te esperando!_`;
  }

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
    });

    const timeFormatted = appointmentDate.toLocaleTimeString('pt-BR', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
    });

    return { dateFormatted, timeFormatted };
  }
}

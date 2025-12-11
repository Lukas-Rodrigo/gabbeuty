export interface SessionEventData {
  userId: string;
  qrCode?: string;
  connected?: boolean;
  error?: Error;
}

export abstract class SessionEventListener {
  /**
   * Aguarda um evento específico para um usuário
   * @param eventName Nome do evento (ex: "qr", "connection")
   * @param userId ID do usuário
   * @param timeoutMs Timeout em milissegundos
   * @returns Promise que resolve com os dados do evento
   */
  abstract waitForEvent(
    eventName: string,
    userId: string,
    timeoutMs?: number,
  ): Promise<SessionEventData>;

  /**
   * Cancela a escuta de um evento
   */
  abstract cancelWait(eventName: string, userId: string): void;
}

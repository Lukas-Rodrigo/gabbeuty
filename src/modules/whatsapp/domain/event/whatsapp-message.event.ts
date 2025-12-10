export interface WhatsAppMessageEvent {
  userId: string;
  from: string;
  message: string;
  timestamp: number | undefined;
  confirm: {
    appointmentId?: string | null;
    buttonMessage?: string | null;
  };
}

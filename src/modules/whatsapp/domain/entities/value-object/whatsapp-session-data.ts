export class WhatsAppSessionData {
  constructor(private readonly raw: Record<string, any>) {}

  static fromRaw(data: Record<string, any>) {
    return new WhatsAppSessionData(data);
  }

  toRaw() {
    return this.raw;
  }
}

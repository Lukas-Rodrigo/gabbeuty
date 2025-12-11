export class QRCode {
  private constructor(private readonly value: string) {}

  static create(qrValue: string): QRCode {
    if (!qrValue || qrValue.trim().length === 0) {
      throw new Error('QR Code value cannot be empty');
    }
    return new QRCode(qrValue);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: QRCode): boolean {
    return this.value === other.value;
  }
}

export class PhoneNumber {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  static create(phoneNumber: string): PhoneNumber {
    return new PhoneNumber(phoneNumber);
  }

  private validate(phoneNumber: string): void {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10 || cleanNumber.length > 15) {
      throw new Error('Invalid phone number format');
    }
  }

  getValue(): string {
    return this.value;
  }

  toJID(): string {
    const cleanNumber = this.value.replace(/\D/g, '');
    return `${cleanNumber}@s.whatsapp.net`;
  }

  equals(other: PhoneNumber): boolean {
    return this.value === other.value;
  }
}

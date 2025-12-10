import { Entity } from '@/_shared/entities/base-entity.entity';
import { PhoneNumber } from './value-object/phone-number';
import { QRCode } from './value-object/qr-code';

export enum SessionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  QR_GENERATED = 'QR_GENERATED',
  ERROR = 'ERROR',
}

interface WhatsAppSessionProps {
  userId: string;
  phoneNumber?: PhoneNumber;
  status: SessionStatus;
  qrCode?: QRCode;
  retryCount: number;
  maxRetries: number;
  lastActivity: Date;
  connectedAt?: Date;
  disconnectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class WhatsAppSessionEntity extends Entity<WhatsAppSessionProps> {
  static create(
    props: WhatsAppSessionProps,
    id?: string,
  ): WhatsAppSessionEntity {
    return new WhatsAppSessionEntity(
      {
        ...props,
      },
      id,
    );
  }

  get userId(): string {
    return this.props.userId;
  }

  get phoneNumber(): PhoneNumber | undefined {
    return this.props.phoneNumber;
  }

  get status(): SessionStatus {
    return this.props.status;
  }

  get qrCode(): QRCode | undefined {
    return this.props.qrCode;
  }

  get retryCount() {
    return this.props.retryCount;
  }

  get maxRetries() {
    return this.props.maxRetries;
  }

  get connectedAt() {
    return this.props.connectedAt;
  }

  get disconnectedAt() {
    return this.props.disconnectedAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get isConnected(): boolean {
    return this.props.status === SessionStatus.CONNECTED;
  }

  get canRetry(): boolean {
    return this.props.retryCount < this.props.maxRetries;
  }

  get lastActivity(): Date {
    return this.props.lastActivity;
  }

  setQRCode(qrCode: QRCode): void {
    this.props.qrCode = qrCode;
    this.props.status = SessionStatus.QR_GENERATED;
    this.props.updatedAt = new Date();
  }

  markAsConnected(phoneNumber?: PhoneNumber): void {
    this.props.status = SessionStatus.CONNECTED;
    this.props.connectedAt = new Date();
    this.props.retryCount = 0;
    this.props.qrCode = undefined;
    if (phoneNumber) {
      this.props.phoneNumber = phoneNumber;
    }
    this.props.updatedAt = new Date();
  }

  markAsConnecting(): void {
    this.props.status = SessionStatus.CONNECTING;
    this.props.updatedAt = new Date();
  }

  disconnect(): void {
    this.props.status = SessionStatus.DISCONNECTED;
    this.props.disconnectedAt = new Date();
    this.props.qrCode = undefined;
    this.props.updatedAt = new Date();
  }

  markAsError(): void {
    this.props.status = SessionStatus.ERROR;
    this.props.updatedAt = new Date();
  }

  incrementRetry(): void {
    this.props.retryCount++;
    this.props.updatedAt = new Date();
  }

  updateActivity(): void {
    this.props.lastActivity = new Date();
    this.props.updatedAt = new Date();
  }

  updateStatus(newStatus: SessionStatus, phoneNumber?: PhoneNumber): void {
    switch (newStatus) {
      case SessionStatus.CONNECTED:
        this.markAsConnected(phoneNumber);
        break;
      case SessionStatus.DISCONNECTED:
        this.disconnect();
        break;
      case SessionStatus.CONNECTING:
        this.markAsConnecting();
        break;
      case SessionStatus.ERROR:
        this.markAsError();
        break;
      case SessionStatus.QR_GENERATED:
        // QR_GENERATED is handled by setQRCode method
        break;
    }
  }

  toJSON(): WhatsAppSessionProps {
    return { ...this.props };
  }
}

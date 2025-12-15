import { PrismaProvider } from '@/infra/database/prisma/prisma.provider';
import { PhoneNumber } from '@/modules/whatsapp/domain/entities/value-object/phone-number';
import { QRCode } from '@/modules/whatsapp/domain/entities/value-object/qr-code';
import {
  SessionStatus,
  WhatsAppSessionEntity,
} from '@/modules/whatsapp/domain/entities/whatsapp-session.entity';
import { WhatsAppSessionRepository } from '@/modules/whatsapp/domain/repositories/whatsapp-session.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaWhatsappSession implements WhatsAppSessionRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(raw: WhatsAppSessionEntity): Promise<void> {
    await this.prisma.whatsappSession.upsert({
      where: {
        userId: raw.userId,
      },
      update: {
        connectedAt: raw.connectedAt,
        disconnectedAt: raw.disconnectedAt,
        lastActivity: raw.lastActivity,
        maxRetries: raw.maxRetries,
        phoneNumber: raw.phoneNumber?.getValue(),
        retryCount: raw.retryCount,
        status: raw.status,
        updatedAt: raw.updatedAt,
      },
      create: {
        connectedAt: raw.connectedAt,
        createdAt: raw.createdAt,
        disconnectedAt: raw.disconnectedAt,
        id: raw.id.toValue(),
        lastActivity: raw.lastActivity,
        maxRetries: raw.maxRetries,
        phoneNumber: raw.phoneNumber?.getValue(),
        retryCount: raw.retryCount,
        status: raw.status,
        updatedAt: raw.updatedAt,
        userId: raw.userId,
      },
    });
  }

  async findById(id: string): Promise<WhatsAppSessionEntity | null> {
    const session = await this.prisma.whatsappSession.findUnique({
      where: { id },
    });

    if (!session) return null;

    return this.toDomain(session);
  }

  async findByUserId(userId: string): Promise<WhatsAppSessionEntity | null> {
    const session = await this.prisma.whatsappSession.findUnique({
      where: { userId },
    });

    if (!session) return null;

    return this.toDomain(session);
  }
  async update(raw: WhatsAppSessionEntity): Promise<void> {
    await this.prisma.whatsappSession.update({
      where: { id: raw.id.toValue() },
      data: {
        phoneNumber: raw.phoneNumber?.getValue(),
        status: raw.status as any,
        retryCount: raw.retryCount,
        lastActivity: raw.lastActivity,
        connectedAt: raw.connectedAt,
        disconnectedAt: raw.disconnectedAt,
        updatedAt: new Date(),
      },
    });
  }
  async delete(id: string): Promise<void> {
    await this.prisma.whatsappSession.delete({
      where: { id },
    });
  }
  async findAll(): Promise<WhatsAppSessionEntity[]> {
    const sessions = await this.prisma.whatsappSession.findMany();
    return sessions.map((session) => this.toDomain(session));
  }
  private toDomain(raw: any): WhatsAppSessionEntity {
    return new WhatsAppSessionEntity(
      {
        userId: raw.userId,
        phoneNumber: raw.phoneNumber
          ? PhoneNumber.create(raw.phoneNumber)
          : undefined,
        status: raw.status as SessionStatus,
        qrCode: raw.qrCode ? QRCode.create(raw.qrCode) : undefined,
        retryCount: raw.retryCount,
        maxRetries: raw.maxRetries,
        lastActivity: raw.lastActivity,
        connectedAt: raw.connectedAt,
        disconnectedAt: raw.disconnectedAt,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }
}

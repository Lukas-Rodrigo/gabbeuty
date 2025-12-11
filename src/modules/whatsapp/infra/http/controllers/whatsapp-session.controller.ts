import { mapDomainErrorToHttpException } from '@/_shared/filters/map-domain-error';
import { QueueProvider } from '@/_shared/queue/queue-manager';
import { CurrentUser } from '@/modules/auth/infra/jwt/current-user.decorator';
import { CreateWhatsAppSessionUseCase } from '@/modules/whatsapp/application/use-cases/create-whatsapp-session.use-case';
import { DisconnectWhatsappSessionUseCase } from '@/modules/whatsapp/application/use-cases/disconnect-whatsapp-session.use-case';
import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

@Controller('whatsapp')
export class WhatsappSessionController {
  constructor(
    private createWhatsappSessionUseCase: CreateWhatsAppSessionUseCase,
    private disconnectWhatsappSessionUseCase: DisconnectWhatsappSessionUseCase,
    private queue: QueueProvider,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createSession(@CurrentUser() user) {
    const result = await this.createWhatsappSessionUseCase.execute({
      userId: user.sub,
    });

    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }

    return result.value;
  }

  @Post('disconnect')
  @HttpCode(HttpStatus.OK)
  async disconnect(@CurrentUser() user) {
    const result = await this.disconnectWhatsappSessionUseCase.execute({
      userId: user.sub,
    });

    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }

    return result.value;
  }
}

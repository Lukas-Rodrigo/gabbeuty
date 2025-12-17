import { mapDomainErrorToHttpException } from '@/_shared/filters/map-domain-error';
import { CurrentUser } from '@/modules/auth/infra/jwt/current-user.decorator';
import { CreateWhatsAppSessionUseCase } from '@/modules/whatsapp/application/use-cases/create-whatsapp-session.use-case';
import { DisconnectWhatsappSessionUseCase } from '@/modules/whatsapp/application/use-cases/disconnect-whatsapp-session.use-case';
import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { WhatsAppApiDoc } from '@/_shared/docs/swagger.decorators';

@Controller('whatsapp')
export class WhatsappSessionController {
  constructor(
    private createWhatsappSessionUseCase: CreateWhatsAppSessionUseCase,
    private disconnectWhatsappSessionUseCase: DisconnectWhatsappSessionUseCase,
  ) {}

  @WhatsAppApiDoc.CreateSession()
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

  @WhatsAppApiDoc.DisconnectSession()
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

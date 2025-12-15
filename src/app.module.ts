import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env';
import { AuthModule } from './modules/auth/infra/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { BullConfigModule } from './infra/queue/bull/bull-config.module';
import { GabbeutyCrmModule } from './modules/gabbeuty-crm/infra/gabbeuty-crm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    BullConfigModule,
    AuthModule,
    WhatsappModule,
    GabbeutyCrmModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { QueueProvider } from '@/_shared/queue/queue-manager';
import { BullQueueProvider } from './bull-queue.provider';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');

        if (redisUrl) {
          try {
            const url = new URL(redisUrl);
            return {
              redis: {
                host: url.hostname,
                port: parseInt(url.port) || 6379,
                password: url.password || undefined,
                maxRetriesPerRequest: null,
              },
              defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: false,
              },
            };
          } catch (error) {
            console.error('Error parsing REDIS_URL:', error);
          }
        }

        return {
          redis: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            password: configService.get('REDIS_PASSWORD'),
            maxRetriesPerRequest: null,
          },
          defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: false,
          },
        };
      },
      inject: [ConfigService],
    }),

    BullModule.registerQueue({
      name: 'calendar-sync',
    }),
    BullModule.registerQueue({
      name: 'notification',
    }),
    BullBoardModule.forRoot({
      route: 'admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'calendar-sync',
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'notification',
      adapter: BullAdapter,
    }),
  ],
  providers: [
    {
      provide: QueueProvider,
      useClass: BullQueueProvider,
    },
  ],
  exports: [BullModule, QueueProvider],
})
export class BullConfigModule {}

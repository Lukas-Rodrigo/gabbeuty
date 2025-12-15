import {
  OnModuleDestroy,
  OnModuleInit,
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { Env } from '@/env';

@Injectable()
export class PrismaProvider
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaProvider.name);

  constructor(@Inject(ConfigService) configService: ConfigService<Env, true>) {
    const databaseUrl = configService.get('DATABASE_URL', { infer: true });
    const nodeEnv = configService.get('NODE_ENV', { infer: true });

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      // log:
      //   nodeEnv === 'development'
      //     ? ['query', 'info', 'warn', 'error']
      //     : ['warn', 'error'],
    });
  }

  onModuleDestroy() {
    this.logger.log('Disconnecting from database');
    void this.$disconnect();
  }

  onModuleInit() {
    this.logger.log('Connecting to database');
    void this.$connect();
  }
}

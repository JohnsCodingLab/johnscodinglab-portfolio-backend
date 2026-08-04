// src/prisma/prisma.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    if (!process.env.DATABASE_URL) {
      console.error('FATAL: DATABASE_URL is not set');
      throw new Error('DATABASE_URL is not set');
    }

    const sslDisabled = process.env.DB_DISABLE_SSL === 'true';
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      ssl: sslDisabled ? false : { rejectUnauthorized: false },
    });
    super({ adapter });

    console.log(
      `[PrismaService] constructed (ssl=${sslDisabled ? 'disabled' : 'enabled'})`,
    );
  }

  async onModuleInit() {
    console.log('[PrismaService] attempting $connect()...');
    const CONNECT_TIMEOUT_MS = 10000;

    try {
      await Promise.race([
        this.$connect(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`DB connect timed out after ${CONNECT_TIMEOUT_MS}ms`)),
            CONNECT_TIMEOUT_MS,
          ),
        ),
      ]);
      console.log('[PrismaService] connected successfully');
      this.logger.log('Database connection established');
    } catch (error) {
      console.error('[PrismaService] CONNECTION FAILED:', error);
      this.logger.error(
        'Failed to connect to database',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('[PrismaService] disconnected');
  }
}

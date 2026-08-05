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
      throw new Error('FATAL: DATABASE_URL environment variable is not set');
    }

    const sslDisabled = process.env.DB_DISABLE_SSL === 'true';
    const connectionUrl = new URL(process.env.DATABASE_URL);

    // Log connection target (without credentials)
    const safeHost = `${connectionUrl.hostname}:${connectionUrl.port || 5432}/${connectionUrl.pathname.slice(1)}`;

    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      ssl: sslDisabled ? false : { rejectUnauthorized: false },
    });
    super({ adapter });

    // Use console.log here since the NestJS logger may not be ready yet in constructor
    console.log(
      `[PrismaService] Configured adapter → ${safeHost} (ssl=${sslDisabled ? 'disabled' : 'enabled'})`,
    );
  }

  async onModuleInit() {
    this.logger.log('Attempting database connection...');
    const CONNECT_TIMEOUT_MS = 10_000;

    try {
      await Promise.race([
        this.$connect(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Database connection timed out after ${CONNECT_TIMEOUT_MS}ms`)),
            CONNECT_TIMEOUT_MS,
          ),
        ),
      ]);
      this.logger.log('✅ Database connection established successfully');
    } catch (error) {
      this.logger.error(
        '❌ Database connection FAILED',
        error instanceof Error ? error.stack : String(error),
      );
      // Re-throw so NestJS knows the module failed to initialize
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}

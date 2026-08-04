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
    const isProd = process.env.NODE_ENV === 'production';
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      // Always use SSL unless explicitly told not to — Supabase requires it
      // regardless of NODE_ENV.
      ssl: process.env.DB_DISABLE_SSL === 'true'
        ? false
        : { rejectUnauthorized: false },
    });
    super({ adapter });

    if (!process.env.DATABASE_URL) {
      // This will throw later anyway, but fail loudly and early.
      throw new Error('DATABASE_URL is not set');
    }

    this.logger.log(
      `Prisma initialized (env=${process.env.NODE_ENV ?? 'undefined'}, ssl=${
        process.env.DB_DISABLE_SSL === 'true' ? 'disabled' : 'enabled'
      })`,
    );
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error(
        'Failed to connect to database',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}

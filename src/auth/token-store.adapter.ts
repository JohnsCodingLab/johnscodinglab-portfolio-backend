import { Injectable } from '@nestjs/common';
import {
  TokenStore,
  StoredRefreshToken,
} from '@johnscodinglab/enterprise-core';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaTokenStore implements TokenStore {
  constructor(private readonly prisma: PrismaService) {}

  async save(token: StoredRefreshToken): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        jti: token.jti,
        userId: token.userId,
        tokenVersion: token.tokenVersion,
        expiresAt: token.expiresAt,
        createdAt: token.createdAt,
      },
    });
  }

  async find(jti: string): Promise<StoredRefreshToken | null> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { jti },
    });

    if (!token) return null;

    return {
      jti: token.jti,
      userId: token.userId,
      tokenVersion: token.tokenVersion,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
      revokedAt: token.revokedAt ?? undefined,
    };
  }

  async revoke(jti: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { jti },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }
}

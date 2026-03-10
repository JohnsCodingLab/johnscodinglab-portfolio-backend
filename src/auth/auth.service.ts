import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createAuth,
  createTokenManager,
  hashPassword,
  verifyPassword,
  NotFoundError,
  UnauthorizedError,
} from '@johnscodinglab/enterprise-core';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaTokenStore } from './token-store.adapter';

@Injectable()
export class AuthService implements OnModuleInit {
  private tokenManager: ReturnType<typeof createTokenManager>;
  private auth: ReturnType<typeof createAuth>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly tokenStore: PrismaTokenStore,
  ) {}

  onModuleInit() {
    this.auth = createAuth({
      jwtSecret: this.config.get<string>('JWT_SECRET')!,
      refreshTokenSecret: this.config.get<string>('JWT_REFRESH_SECRET'),
      accessTokenExpiry: '15m',
      refreshTokenExpiry: '7d',
      issuer: 'johnscodinglab-portfolio-backend',
    });

    this.tokenManager = createTokenManager({
      auth: this.auth,
      store: this.tokenStore,
    });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = await this.tokenManager.issueTokenPair({
      userId: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    return this.tokenManager.refresh(refreshToken);
  }

  async logout(refreshToken: string) {
    await this.tokenManager.revokeSession(refreshToken);
  }

  async logoutAll(userId: string) {
    await this.tokenManager.revokeAllSessions(userId);
  }

  verifyAccessToken(token: string) {
    return this.auth.verifyAccessToken(token);
  }

  async seedAdmin() {
    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (existingAdmin) {
      return { message: 'Admin already exists' };
    }

    const hashedPassword = await hashPassword('admin');

    const admin = await this.prisma.user.create({
      data: {
        email: 'engrlevijohn@gmail.com',
        name: 'Levi John Favour',
        password: hashedPassword,
        role: 'admin',
      },
    });

    return {
      message: 'Admin created successfully',
      email: admin.email,
    };
  }
}

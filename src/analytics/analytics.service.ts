import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TrackPageViewDto } from './dto/track-page-view.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async track(dto: TrackPageViewDto, req: { ip?: string; userAgent?: string }) {
    const ipHash = req.ip
      ? createHash('sha256').update(req.ip).digest('hex').slice(0, 16)
      : null;

    return this.prisma.pageView.create({
      data: {
        path: dto.path,
        referrer: dto.referrer ?? null,
        userAgent: req.userAgent ?? null,
        ipHash,
      },
    });
  }

  async getStats() {
    const [totalViews, uniqueVisitors, topPages, recentViews] =
      await Promise.all([
        // Total page views
        this.prisma.pageView.count(),

        // Unique visitors (by IP hash)
        this.prisma.pageView
          .groupBy({ by: ['ipHash'], where: { ipHash: { not: null } } })
          .then((groups) => groups.length),

        // Top 10 most viewed pages
        this.prisma.pageView.groupBy({
          by: ['path'],
          _count: { path: true },
          orderBy: { _count: { path: 'desc' } },
          take: 10,
        }),

        // Last 50 page views
        this.prisma.pageView.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
      ]);

    return { totalViews, uniqueVisitors, topPages, recentViews };
  }

  async getViewsByPath(path: string) {
    return this.prisma.pageView.count({
      where: { path },
    });
  }
}

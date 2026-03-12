import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { TrackPageViewDto } from './dto/track-page-view.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 10000 } }) // 10 reqs per 10 secs (for rapid page navigating)
  @Post('track')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track a page view (public)' })
  track(@Body() dto: TrackPageViewDto, @Req() req: Request) {
    return this.analyticsService.track(dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Roles('admin')
  @Get('stats')
  @ApiOperation({ summary: 'Get analytics dashboard stats (admin only)' })
  getStats() {
    return this.analyticsService.getStats();
  }

  @Roles('admin')
  @Get('views/:path')
  @ApiOperation({ summary: 'Get view count for a specific path (admin only)' })
  getViewsByPath(@Param('path') path: string) {
    return this.analyticsService.getViewsByPath('/' + path);
  }
}

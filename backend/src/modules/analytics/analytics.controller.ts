import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  getDashboardAnalytics() {
    return this.analyticsService.getDashboardAnalytics();
  }

  @Get('courses')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  getCourseAnalytics() {
    return this.analyticsService.getCourseAnalytics();
  }

  @Get('courses/:courseId')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  getCourseAnalyticsById(@Param('courseId') courseId: string) {
    return this.analyticsService.getCourseAnalytics();
  }

  @Get('engagement')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  getEngagementAnalytics() {
    return this.analyticsService.getEngagementAnalytics();
  }

  @Get('revenue')
  @Roles(Role.ADMIN)
  getRevenueAnalytics() {
    return this.analyticsService.getRevenueAnalytics();
  }

  @Get('users')
  @Roles(Role.ADMIN)
  getUserAnalytics() {
    return this.analyticsService.getCourseAnalytics();
  }
} 
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardAnalytics() {
    const [
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      recentActivity,
      topCourses
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.course.count(),
      this.prisma.enrollment.count(),
      this.calculateTotalRevenue(),
      this.getRecentActivity(),
      this.getTopPerformingCourses()
    ]);

    const averageCompletionRate = await this.calculateAverageCompletionRate();
    const monthlyGrowth = await this.calculateMonthlyGrowth();

    return {
      totalRevenue,
      totalStudents,
      totalCourses,
      averageCompletionRate,
      monthlyGrowth,
      topPerformingCourses: topCourses,
      recentActivity,
      revenueTrend: await this.getRevenueTrend()
    };
  }

  async getCourseAnalytics() {
    const courses = await this.prisma.course.findMany({
      include: {
        enrollments: true,
        instructor: {
          select: { name: true }
        }
      }
    });

    const courseAnalytics = await Promise.all(courses.map(async course => ({
      courseId: course.id,
      courseTitle: course.title,
      totalEnrollments: course.enrollments.length,
      completionRate: await this.calculateCourseCompletionRate(course.id),
      averageRating: 4.5, // Placeholder - would need ratings table
      totalRevenue: course.enrollments.length * 50, // Placeholder calculation
      activeStudents: course.enrollments.length * 0.8 // Placeholder
    })));

    return courseAnalytics;
  }

  async getEngagementAnalytics() {
    // Placeholder data - would need activity tracking
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      activeUsers: Math.floor(Math.random() * 200) + 100,
      courseViews: Math.floor(Math.random() * 500) + 200,
      timeSpent: Math.floor(Math.random() * 60) + 30,
      quizAttempts: Math.floor(Math.random() * 100) + 50
    }));
  }

  async getRevenueAnalytics() {
    // Placeholder data - would need payment tracking
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      period: `${month} 2024`,
      revenue: Math.floor(Math.random() * 20000) + 10000,
      enrollments: Math.floor(Math.random() * 300) + 100,
      growth: Math.floor(Math.random() * 20) + 5
    }));
  }

  private async calculateTotalRevenue(): Promise<number> {
    // Placeholder calculation
    const totalEnrollments = await this.prisma.enrollment.count();
    return totalEnrollments * 50; // Assume $50 per enrollment
  }

  private async calculateAverageCompletionRate(): Promise<number> {
    const enrollments = await this.prisma.enrollment.findMany({
      include: {
        progress: true
      }
    });

    if (enrollments.length === 0) return 0;

    const completionRates = enrollments.map(enrollment => {
      const totalModules = enrollment.progress.length;
      const completedModules = enrollment.progress.filter(p => p.completed).length;
      return totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    });

    return completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
  }

  private async calculateMonthlyGrowth(): Promise<number> {
    // Placeholder calculation
    return 12.5;
  }

  private async getRecentActivity() {
    // Placeholder data
    return [
      {
        date: '2024-01-15',
        activeUsers: 234,
        courseViews: 567,
        timeSpent: 45,
        quizAttempts: 89
      },
      {
        date: '2024-01-14',
        activeUsers: 198,
        courseViews: 432,
        timeSpent: 38,
        quizAttempts: 67
      },
      {
        date: '2024-01-13',
        activeUsers: 267,
        courseViews: 623,
        timeSpent: 52,
        quizAttempts: 94
      }
    ];
  }

  private async getTopPerformingCourses() {
    const courses = await this.prisma.course.findMany({
      include: {
        enrollments: true,
        instructor: {
          select: { name: true }
        }
      },
      take: 5
    });

    const topCourses = await Promise.all(courses.map(async course => ({
      courseId: course.id,
      courseTitle: course.title,
      instructor: course.instructor.name,
      totalEnrollments: course.enrollments.length,
      completionRate: await this.calculateCourseCompletionRate(course.id),
      averageRating: 4.5,
      totalRevenue: course.enrollments.length * 50,
      activeStudents: Math.floor(course.enrollments.length * 0.8)
    })));

    return topCourses;
  }

  private async calculateCourseCompletionRate(courseId: string): Promise<number> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        progress: true
      }
    });

    if (enrollments.length === 0) return 0;

    const completionRates = enrollments.map(enrollment => {
      const totalModules = enrollment.progress.length;
      const completedModules = enrollment.progress.filter(p => p.completed).length;
      return totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    });

    return completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
  }

  private async getRevenueTrend() {
    // Placeholder data
    return [
      {
        period: 'Jan 2024',
        revenue: 15600,
        enrollments: 234,
        growth: 15.2
      },
      {
        period: 'Dec 2023',
        revenue: 13500,
        enrollments: 198,
        growth: 8.7
      },
      {
        period: 'Nov 2023',
        revenue: 12400,
        enrollments: 187,
        growth: 12.1
      }
    ];
  }
} 
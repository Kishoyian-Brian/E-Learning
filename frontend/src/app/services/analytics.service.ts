import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Environment configuration
const environment = {
  apiUrl: 'http://localhost:3000/api/v1'
};

export interface DashboardAnalytics {
  totalStudents: number;
  totalCourses: number;
  averageCompletionRate: number;
  monthlyGrowth: number;
  topPerformingCourses: CourseAnalytics[];
  recentActivity: ActivityData[];
}

export interface CourseAnalytics {
  courseId: string;
  courseTitle: string;
  totalEnrollments: number;
  completionRate: number;
  activeStudents: number;
}

export interface ActivityData {
  date: string;
  activeUsers: number;
  courseViews: number;
  timeSpent: number;
  quizAttempts: number;
}

export interface EngagementAnalytics {
  date: string;
  activeUsers: number;
  courseViews: number;
  timeSpent: number;
  quizAttempts: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  // Get dashboard analytics
  getDashboardAnalytics(): Observable<DashboardAnalytics> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`).pipe(
      map(data => this.mapDashboardAnalytics(data)),
      catchError(error => {
        console.error('Error fetching dashboard analytics:', error);
        return of(this.getMockDashboardAnalytics());
      })
    );
  }

  // Get course analytics
  getCourseAnalytics(): Observable<CourseAnalytics[]> {
    return this.http.get<any[]>(`${this.apiUrl}/courses`).pipe(
      map(courses => courses.map(course => this.mapCourseAnalytics(course))),
      catchError(error => {
        console.error('Error fetching course analytics:', error);
        return of(this.getMockCourseAnalytics());
      })
    );
  }

  // Get engagement analytics
  getEngagementAnalytics(): Observable<EngagementAnalytics[]> {
    return this.http.get<any[]>(`${this.apiUrl}/engagement`).pipe(
      map(data => data.map(item => this.mapEngagementAnalytics(item))),
      catchError(error => {
        console.error('Error fetching engagement analytics:', error);
        return of(this.getMockEngagementAnalytics());
      })
    );
  }

  // Get analytics for specific course
  getCourseAnalyticsById(courseId: string): Observable<CourseAnalytics> {
    return this.http.get<any>(`${this.apiUrl}/courses/${courseId}`).pipe(
      map(course => this.mapCourseAnalytics(course)),
      catchError(error => {
        console.error('Error fetching course analytics:', error);
        throw error;
      })
    );
  }

  // Get user analytics
  getUserAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users`).pipe(
      catchError(error => {
        console.error('Error fetching user analytics:', error);
        return of({});
      })
    );
  }

  // Get revenue analytics
  getRevenueAnalytics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/revenue`).pipe(
      map(data => data.map(item => this.mapRevenueData(item))),
      catchError(error => {
        console.error('Error fetching revenue analytics:', error);
        return of([]);
      })
    );
  }

  // Helper methods to map backend data to frontend interfaces
  private mapDashboardAnalytics(data: any): DashboardAnalytics {
    return {
      totalStudents: data.totalStudents || 0,
      totalCourses: data.totalCourses || 0,
      averageCompletionRate: data.averageCompletionRate || 0,
      monthlyGrowth: data.monthlyGrowth || 0,
      topPerformingCourses: (data.topPerformingCourses || []).map((course: any) => this.mapCourseAnalytics(course)),
      recentActivity: (data.recentActivity || []).map((activity: any) => this.mapActivityData(activity))
    };
  }

  private mapCourseAnalytics(course: any): CourseAnalytics {
    return {
      courseId: course.courseId || course.id,
      courseTitle: course.courseTitle || course.title,
      totalEnrollments: course.totalEnrollments || 0,
      completionRate: course.completionRate || 0,
      activeStudents: course.activeStudents || 0
    };
  }

  private mapActivityData(activity: any): ActivityData {
    return {
      date: activity.date,
      activeUsers: activity.activeUsers || 0,
      courseViews: activity.courseViews || 0,
      timeSpent: activity.timeSpent || 0,
      quizAttempts: activity.quizAttempts || 0
    };
  }

  private mapRevenueData(revenue: any): any {
    return {
      period: revenue.period,
      revenue: revenue.revenue || 0,
      enrollments: revenue.enrollments || 0,
      growth: revenue.growth || 0
    };
  }

  private mapEngagementAnalytics(engagement: any): EngagementAnalytics {
    return {
      date: engagement.date,
      activeUsers: engagement.activeUsers || 0,
      courseViews: engagement.courseViews || 0,
      timeSpent: engagement.timeSpent || 0,
      quizAttempts: engagement.quizAttempts || 0
    };
  }

  // Mock data for development (fallback)
  getMockDashboardAnalytics(): DashboardAnalytics {
    return {
      totalStudents: 1247,
      totalCourses: 23,
      averageCompletionRate: 78.5,
      monthlyGrowth: 12.3,
      topPerformingCourses: [
        {
          courseId: '1',
          courseTitle: 'Introduction to Web Development',
          totalEnrollments: 156,
          completionRate: 85.2,
          activeStudents: 142
        },
        {
          courseId: '2',
          courseTitle: 'Advanced React Development',
          totalEnrollments: 89,
          completionRate: 72.1,
          activeStudents: 67
        },
        {
          courseId: '3',
          courseTitle: 'Data Science Fundamentals',
          totalEnrollments: 134,
          completionRate: 81.3,
          activeStudents: 118
        }
      ],
      recentActivity: [
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
      ]
    };
  }

  getMockCourseAnalytics(): CourseAnalytics[] {
    return [
      {
        courseId: '1',
        courseTitle: 'Introduction to Web Development',
        totalEnrollments: 156,
        completionRate: 85.2,
        activeStudents: 142
      },
      {
        courseId: '2',
        courseTitle: 'Advanced React Development',
        totalEnrollments: 89,
        completionRate: 72.1,
        activeStudents: 67
      },
      {
        courseId: '3',
        courseTitle: 'Data Science Fundamentals',
        totalEnrollments: 134,
        completionRate: 81.3,
        activeStudents: 118
      },
      {
        courseId: '4',
        courseTitle: 'Python for Beginners',
        totalEnrollments: 203,
        completionRate: 78.9,
        activeStudents: 178
      },
      {
        courseId: '5',
        courseTitle: 'Machine Learning Basics',
        totalEnrollments: 67,
        completionRate: 65.4,
        activeStudents: 45
      }
    ];
  }

  getMockEngagementAnalytics(): EngagementAnalytics[] {
    return [
      { date: '2024-01-15', activeUsers: 234, courseViews: 567, timeSpent: 45, quizAttempts: 89 },
      { date: '2024-01-14', activeUsers: 198, courseViews: 432, timeSpent: 38, quizAttempts: 67 },
      { date: '2024-01-13', activeUsers: 267, courseViews: 623, timeSpent: 52, quizAttempts: 94 },
      { date: '2024-01-12', activeUsers: 189, courseViews: 445, timeSpent: 41, quizAttempts: 73 },
      { date: '2024-01-11', activeUsers: 312, courseViews: 678, timeSpent: 58, quizAttempts: 102 },
      { date: '2024-01-10', activeUsers: 245, courseViews: 534, timeSpent: 47, quizAttempts: 81 },
      { date: '2024-01-09', activeUsers: 178, courseViews: 389, timeSpent: 35, quizAttempts: 59 }
    ];
  }
} 
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  activeUsers: number;
  pendingApprovals: number;
  totalEnrollments: number;
  monthlyGrowth: number;
  platformHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface CourseManagement {
  id: string;
  title: string;
  instructor: string;
  instructorId: string;
  category: string;
  level: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_REVIEW' | 'REJECTED';
  enrollments: number;
  rating: number;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  lastReviewedAt?: Date;
  reviewNotes?: string;
  featured: boolean;
  certificateEligible: boolean;
  totalClasses: number;
  duration: number;
  thumbnail: string;
  shortDescription: string;
  tags: string[];
}

export interface UserManagement {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformAnalytics {
  userGrowth: {
    period: string;
    newUsers: number;
    activeUsers: number;
    totalUsers: number;
  }[];
  coursePerformance: {
    category: string;
    enrollments: number;
    averageRating: number;
  }[];
  topCourses: {
    id: string;
    title: string;
    instructor: string;
    enrollments: number;
    rating: number;
  }[];
  topInstructors: {
    id: string;
    name: string;
    courses: number;
    students: number;
    rating: number;
  }[];
}

export interface SystemHealth {
  serverStatus: 'online' | 'offline' | 'maintenance';
  databaseStatus: 'healthy' | 'warning' | 'critical';
  storageUsage: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  lastBackup: Date;
  uptime: number;
  errors: {
    timestamp: Date;
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    component: string;
  }[];
}

export interface ApprovalRequest {
  id: string;
  type: 'COURSE' | 'INSTRUCTOR' | 'CONTENT' | 'CERTIFICATE';
  title: string;
  description: string;
  requester: string;
  requesterId: string;
  submittedAt: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export interface AdminNotification {
  id: string;
  type: 'SYSTEM' | 'USER' | 'COURSE' | 'PAYMENT' | 'SECURITY';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: Date;
  actionRequired: boolean;
  actionUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private statsSubject = new BehaviorSubject<AdminStats | null>(null);
  private coursesSubject = new BehaviorSubject<CourseManagement[]>([]);
  private usersSubject = new BehaviorSubject<UserManagement[]>([]);
  private analyticsSubject = new BehaviorSubject<PlatformAnalytics | null>(null);
  private systemHealthSubject = new BehaviorSubject<SystemHealth | null>(null);
  private approvalsSubject = new BehaviorSubject<ApprovalRequest[]>([]);
  private notificationsSubject = new BehaviorSubject<AdminNotification[]>([]);

  private apiBase = '/api/v1';

  constructor(private http: HttpClient) {}

  get stats$(): Observable<AdminStats | null> {
    return this.statsSubject.asObservable();
  }
  get courses$(): Observable<CourseManagement[]> {
    return this.coursesSubject.asObservable();
  }
  get users$(): Observable<UserManagement[]> {
    return this.usersSubject.asObservable();
  }
  get analytics$(): Observable<PlatformAnalytics | null> {
    return this.analyticsSubject.asObservable();
  }
  get systemHealth$(): Observable<SystemHealth | null> {
    return this.systemHealthSubject.asObservable();
  }
  get approvals$(): Observable<ApprovalRequest[]> {
    return this.approvalsSubject.asObservable();
  }
  get notifications$(): Observable<AdminNotification[]> {
    return this.notificationsSubject.asObservable();
  }

  loadDashboardData(): Observable<{
    stats: AdminStats;
    courses: CourseManagement[];
    users: UserManagement[];
    analytics: PlatformAnalytics;
    systemHealth: SystemHealth;
    approvals: ApprovalRequest[];
    notifications: AdminNotification[];
  }> {
    return forkJoin({
      stats: this.getStats(),
      courses: this.getCourses(),
      users: this.getUsers(),
      analytics: this.getAnalytics(),
      systemHealth: this.getSystemHealth(),
      approvals: this.getApprovals(),
      notifications: this.getNotifications()
    }).pipe(
      tap(data => {
        this.statsSubject.next(data.stats);
        this.coursesSubject.next(data.courses);
        this.usersSubject.next(data.users);
        this.analyticsSubject.next(data.analytics);
        this.systemHealthSubject.next(data.systemHealth);
        this.approvalsSubject.next(data.approvals);
        this.notificationsSubject.next(data.notifications);
      })
    );
  }

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiBase}/admin/stats`);
  }
  getCourses(): Observable<CourseManagement[]> {
    return this.http.get<CourseManagement[]>(`${this.apiBase}/courses`);
  }
  getUsers(): Observable<UserManagement[]> {
    return this.http.get<UserManagement[]>(`${this.apiBase}/users`);
  }
  getAnalytics(): Observable<PlatformAnalytics> {
    return this.http.get<PlatformAnalytics>(`${this.apiBase}/analytics`);
  }
  getSystemHealth(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>(`${this.apiBase}/admin/system-health`);
  }
  getApprovals(): Observable<ApprovalRequest[]> {
    return this.http.get<ApprovalRequest[]>(`${this.apiBase}/admin/approvals`);
  }
  getNotifications(): Observable<AdminNotification[]> {
    return this.http.get<AdminNotification[]>(`${this.apiBase}/admin/notifications`);
  }

  // Course Management
  updateCourseStatus(courseId: string, status: CourseManagement['status'], notes?: string): Observable<CourseManagement> {
    return this.http.patch<CourseManagement>(`${this.apiBase}/courses/${courseId}/status`, { status, notes });
  }
  toggleCourseFeatured(courseId: string): Observable<CourseManagement> {
    return this.http.patch<CourseManagement>(`${this.apiBase}/courses/${courseId}/featured`, {});
  }
  deleteCourse(courseId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/courses/${courseId}`);
  }

  // User Management
  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/users/${userId}`);
  }

  // Approvals
  approveRequest(requestId: string, notes?: string): Observable<ApprovalRequest> {
    return this.http.post<ApprovalRequest>(`${this.apiBase}/admin/approvals/${requestId}/approve`, { notes });
  }
  rejectRequest(requestId: string, notes: string): Observable<ApprovalRequest> {
    return this.http.post<ApprovalRequest>(`${this.apiBase}/admin/approvals/${requestId}/reject`, { notes });
  }

  // Notifications
  markNotificationAsRead(notificationId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiBase}/admin/notifications/${notificationId}/read`, {});
  }
} 
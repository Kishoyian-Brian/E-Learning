import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  enrollmentDate: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'PENDING' | 'WAITLISTED' | 'REJECTED';
  completionDate?: Date;
  progress: number; // percentage
  grade?: string;
  certificateEarned: boolean;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  amount: number;
  currency: string;
  lastActivityDate: Date;
  totalModules: number;
  completedModules: number;
  totalAssignments: number;
  completedAssignments: number;
  totalQuizzes: number;
  completedQuizzes: number;
}

export interface EnrollmentApplication {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  applicationDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED';
  reason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  documents?: string[]; // URLs to uploaded documents
  notes?: string;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  pendingApplications: number;
  waitlistedStudents: number;
  averageCompletionRate: number;
  monthlyEnrollments: number;
  revenueThisMonth: number;
  topCourses: { courseId: string; courseTitle: string; enrollments: number }[];
}

export interface CourseEnrollmentData {
  courseId: string;
  courseTitle: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
  averageGrade: string;
  revenue: number;
  enrollmentTrend: { month: string; enrollments: number }[];
}

export interface StudentEnrollmentHistory {
  studentId: string;
  studentName: string;
  enrollments: Enrollment[];
  totalCourses: number;
  completedCourses: number;
  averageGrade: string;
  totalSpent: number;
  certificatesEarned: number;
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private apiUrl = 'http://localhost:3000/api/v1'; // Backend API URL with v1 prefix
  private enrollmentChangedSource = new Subject<void>();
  enrollmentChanged$ = this.enrollmentChangedSource.asObservable();

  constructor(private http: HttpClient) { }

  // Enrollment Management
  getEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/enrollments`);
  }

  getEnrollmentById(id: string): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/enrollments/${id}`);
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/enrollments/my-enrollments`);
  }

  getStudentEnrollments(studentId: string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/enrollments/my-enrollments`);
  }

  getCourseEnrollments(courseId: string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/enrollments/course/${courseId}`);
  }

  createEnrollment(enrollment: Partial<Enrollment>): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.apiUrl}/enrollments`, enrollment);
  }

  updateEnrollment(id: string, enrollment: Partial<Enrollment>): Observable<Enrollment> {
    return this.http.patch<Enrollment>(`${this.apiUrl}/enrollments/${id}`, enrollment);
  }

  deleteEnrollment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/enrollments/${id}`);
  }

  dropEnrollment(id: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/enrollments/${id}`, { 
      status: 'DROPPED',
      reason 
    });
  }

  completeEnrollment(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/enrollments/${id}`, { 
      status: 'COMPLETED',
      completionDate: new Date()
    });
  }

  // Application Management
  getApplications(): Observable<EnrollmentApplication[]> {
    return this.http.get<EnrollmentApplication[]>(`${this.apiUrl}/enrollment-applications`);
  }

  getApplicationById(id: string): Observable<EnrollmentApplication> {
    return this.http.get<EnrollmentApplication>(`${this.apiUrl}/enrollment-applications/${id}`);
  }

  submitApplication(application: Partial<EnrollmentApplication>): Observable<EnrollmentApplication> {
    return this.http.post<EnrollmentApplication>(`${this.apiUrl}/enrollment-applications`, application);
  }

  approveApplication(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/enrollment-applications/${id}/approve`, {});
  }

  rejectApplication(id: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/enrollment-applications/${id}/reject`, { reason });
  }

  waitlistApplication(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/enrollment-applications/${id}/waitlist`, {});
  }

  // Analytics
  getEnrollmentStats(): Observable<EnrollmentStats> {
    return this.http.get<EnrollmentStats>(`${this.apiUrl}/enrollments/stats`);
  }

  getCourseEnrollmentData(courseId: string): Observable<CourseEnrollmentData> {
    return this.http.get<CourseEnrollmentData>(`${this.apiUrl}/enrollments/course/${courseId}/stats`);
  }

  getStudentEnrollmentHistory(studentId: string): Observable<StudentEnrollmentHistory> {
    return this.http.get<StudentEnrollmentHistory>(`${this.apiUrl}/students/${studentId}/enrollment-history`);
  }

  // Bulk Operations
  bulkApproveApplications(applicationIds: string[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/enrollment-applications/bulk-approve`, { applicationIds });
  }

  bulkRejectApplications(applicationIds: string[], reason: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/enrollment-applications/bulk-reject`, { applicationIds, reason });
  }

  emitEnrollmentChanged() {
    this.enrollmentChangedSource.next();
  }
} 
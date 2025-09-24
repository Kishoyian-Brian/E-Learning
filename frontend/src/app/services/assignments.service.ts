import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  instructorId: string;
  instructorName: string;
  dueDate: Date;
  points: number;
  status: 'DRAFT' | 'PUBLISHED' | 'SUBMITTED' | 'GRADED' | 'LATE';
  submissionType: 'FILE' | 'TEXT' | 'LINK' | 'MULTIPLE';
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxSubmissions?: number;
  rubric?: AssignmentRubric[];
  attachments?: string[]; // URLs to assignment files
  instructions: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  gradedAt?: Date;
  grade?: number;
  feedback?: string;
  submittedBy?: string;
  submittedByName?: string;
  submissionFiles?: string[];
  submissionText?: string;
  submissionLink?: string;
}

export interface AssignmentRubric {
  id: string;
  criterion: string;
  description: string;
  points: number;
  weight: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: Date;
  status: 'SUBMITTED' | 'LATE' | 'GRADED';
  files?: string[];
  text?: string;
  link?: string;
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: Date;
  rubricScores?: { rubricId: string; score: number }[];
}

export interface AssignmentFilters {
  courseId?: string;
  status?: string;
  instructorId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  page?: number;
  limit?: number;
}

export interface AssignmentStats {
  totalAssignments: number;
  publishedAssignments: number;
  draftAssignments: number;
  submittedAssignments: number;
  gradedAssignments: number;
  lateSubmissions: number;
  averageGrade: number;
  totalPoints: number;
  totalSubmissions: number;
  pendingGrading: number;
}

@Injectable({
  providedIn: 'root'
})
export class AssignmentsService {
  private apiUrl = 'http://localhost:3000/api/v1'; // Backend API URL with v1 prefix

  constructor(private http: HttpClient) {}

  // Assignment Management
  getAssignments(filters?: AssignmentFilters): Observable<Assignment[]> {
    let url = `${this.apiUrl}/content`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.status) params.append('status', filters.status);
      if (filters.instructorId) params.append('instructorId', filters.instructorId);
      if (filters.dueDateFrom) params.append('dueDateFrom', filters.dueDateFrom.toISOString());
      if (filters.dueDateTo) params.append('dueDateTo', filters.dueDateTo.toISOString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      params.append('type', 'ASSIGNMENT');
      if (params.toString()) url += `?${params.toString()}`;
    }
    return this.http.get<Assignment[]>(url);
  }

  getAssignmentById(id: string): Observable<Assignment> {
    return this.http.get<Assignment>(`${this.apiUrl}/content/${id}`);
  }

  getCourseAssignments(courseId: string): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/content?courseId=${courseId}&type=ASSIGNMENT`);
  }

  getMyAssignments(): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/content/my-assignments`);
  }

  createAssignment(assignment: Partial<Assignment>): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.apiUrl}/content`, {
      ...assignment,
      type: 'ASSIGNMENT'
    });
  }

  updateAssignment(id: string, assignment: Partial<Assignment>): Observable<Assignment> {
    return this.http.patch<Assignment>(`${this.apiUrl}/content/${id}`, assignment);
  }

  deleteAssignment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/content/${id}`);
  }

  publishAssignment(id: string): Observable<Assignment> {
    return this.http.patch<Assignment>(`${this.apiUrl}/content/${id}`, { status: 'PUBLISHED' });
  }

  unpublishAssignment(id: string): Observable<Assignment> {
    return this.http.patch<Assignment>(`${this.apiUrl}/content/${id}`, { status: 'DRAFT' });
  }

  // Submission Management
  submitAssignment(assignmentId: string, submission: {
    files?: File[];
    text?: string;
    link?: string;
  }): Observable<AssignmentSubmission> {
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    if (submission.text) formData.append('text', submission.text);
    if (submission.link) formData.append('link', submission.link);
    if (submission.files) {
      submission.files.forEach(file => {
        formData.append('files', file);
      });
    }
    
    return this.http.post<AssignmentSubmission>(`${this.apiUrl}/content/${assignmentId}/submit`, formData);
  }

  getSubmissions(assignmentId: string): Observable<AssignmentSubmission[]> {
    return this.http.get<AssignmentSubmission[]>(`${this.apiUrl}/content/${assignmentId}/submissions`);
  }

  getSubmissionById(submissionId: string): Observable<AssignmentSubmission> {
    return this.http.get<AssignmentSubmission>(`${this.apiUrl}/content/submissions/${submissionId}`);
  }

  gradeSubmission(submissionId: string, grade: {
    grade: number;
    feedback?: string;
    rubricScores?: { rubricId: string; score: number }[];
  }): Observable<AssignmentSubmission> {
    return this.http.patch<AssignmentSubmission>(`${this.apiUrl}/content/submissions/${submissionId}/grade`, grade);
  }

  // Analytics
  getAssignmentStats(): Observable<AssignmentStats> {
    return this.http.get<AssignmentStats>(`${this.apiUrl}/content/assignments/stats`);
  }

  getCourseAssignmentStats(courseId: string): Observable<AssignmentStats> {
    return this.http.get<AssignmentStats>(`${this.apiUrl}/content/assignments/course/${courseId}/stats`);
  }

  // Bulk Operations
  bulkPublishAssignments(assignmentIds: string[]): Observable<Assignment[]> {
    return this.http.patch<Assignment[]>(`${this.apiUrl}/content/assignments/bulk-publish`, { assignmentIds });
  }

  bulkDeleteAssignments(assignmentIds: string[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/content/assignments/bulk-delete`, { body: { assignmentIds } });
  }

  // Export
  exportAssignments(courseId: string, format: 'csv' | 'json'): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/content/assignments/export?courseId=${courseId}&format=${format}`);
  }
} 
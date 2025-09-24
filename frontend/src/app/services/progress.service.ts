import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Progress {
  id: string;
  enrollmentId: string;
  moduleId: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
  completionReason?: string;
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  totalModules: number;
  completedModules: number;
  moduleProgressPercentage: number;
  totalQuizzes: number;
  passedQuizzes: number;
  quizProgressPercentage: number;
  overallProgressPercentage: number;
  isCourseCompleted: boolean;
  lastCompletedAt?: Date;
  modules: ModuleProgress[];
  quizzes: QuizProgress[];
}

export interface ModuleProgress {
  id: string;
  title: string;
  order: number;
  completed: boolean;
  completedAt?: Date;
}

export interface QuizProgress {
  id: string;
  title: string;
  passed: boolean;
  score?: number;
  maxScore?: number;
  completedAt?: Date;
}

export interface MarkCompletedDto {
  forceComplete?: boolean;
  completionReason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = 'http://localhost:3000/api/v1/progress';

  constructor(private http: HttpClient) { }

  // Create progress record
  create(createProgressDto: Partial<Progress>): Observable<Progress> {
    return this.http.post<Progress>(`${this.apiUrl}`, createProgressDto);
  }

  // Get all progress records for current user
  findAll(): Observable<Progress[]> {
    return this.http.get<Progress[]>(`${this.apiUrl}`);
  }

  // Get progress records for current user
  findByUser(): Observable<Progress[]> {
    return this.http.get<Progress[]>(`${this.apiUrl}/user`);
  }

  // Get progress records for specific enrollment
  findByEnrollment(enrollmentId: string): Observable<Progress[]> {
    return this.http.get<Progress[]>(`${this.apiUrl}/enrollment/${enrollmentId}`);
  }

  // Get course progress overview
  getCourseProgress(enrollmentId: string): Observable<CourseProgress> {
    return this.http.get<CourseProgress>(`${this.apiUrl}/course/${enrollmentId}`);
  }

  // Get overall progress for current user
  getUserOverallProgress(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/overall`);
  }

  // Get specific progress record
  findOne(id: string): Observable<Progress> {
    return this.http.get<Progress>(`${this.apiUrl}/${id}`);
  }

  // Update progress record
  update(id: string, updateProgressDto: Partial<Progress>): Observable<Progress> {
    return this.http.patch<Progress>(`${this.apiUrl}/${id}`, updateProgressDto);
  }

  // Mark module as completed
  markModuleCompleted(enrollmentId: string, moduleId: string, markCompletedDto?: MarkCompletedDto): Observable<Progress> {
    return this.http.post<Progress>(`${this.apiUrl}/mark-completed/${enrollmentId}/${moduleId}`, markCompletedDto || {});
  }

  // Instructor override for module completion
  instructorOverride(enrollmentId: string, moduleId: string, overrideData: { reason: string; userId: string }): Observable<Progress> {
    return this.http.post<Progress>(`${this.apiUrl}/instructor-override/${enrollmentId}/${moduleId}`, overrideData);
  }
} 
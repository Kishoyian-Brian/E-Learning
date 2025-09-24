import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  title: string;
  courseId: string;
  instructorId: string;
  startTime: Date;
  endTime: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  progress: Progress[];
}

export interface Progress {
  id: string;
  enrollmentId: string;
  moduleId: string;
  completed: boolean;
  completedAt?: Date;
}

export interface Analytics {
  totalCourses: number;
  totalStudents: number;
  totalClasses: number;
  averageRating: number;
  recentEnrollments: number;
}

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private apiUrl = 'http://localhost:3000/api/v1'; 
  constructor(private http: HttpClient) { }

  // Course Management
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses/my-courses`);
  }

  getCourseById(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/courses/${id}`);
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/courses`, course);
  }

  updateCourse(id: string, course: Partial<Course>): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}/courses/${id}`, course);
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/courses/${id}`);
  }

  // Class Management
  getClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(`${this.apiUrl}/instructor/classes`);
  }

  getClassesByCourse(courseId: string): Observable<Class[]> {
    return this.http.get<Class[]>(`${this.apiUrl}/instructor/courses/${courseId}/classes`);
  }

  createClass(classData: Partial<Class>): Observable<Class> {
    return this.http.post<Class>(`${this.apiUrl}/instructor/classes`, classData);
  }

  updateClass(id: string, classData: Partial<Class>): Observable<Class> {
    return this.http.put<Class>(`${this.apiUrl}/instructor/classes/${id}`, classData);
  }

  deleteClass(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/instructor/classes/${id}`);
  }

  // Enrollment Management
  getEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/instructor/enrollments`);
  }

  getEnrollmentsByCourse(courseId: string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/instructor/courses/${courseId}/enrollments`);
  }

  // Analytics - Use the correct analytics endpoint
  getAnalytics(): Observable<Analytics> {
    return this.http.get<Analytics>(`${this.apiUrl}/courses/stats`);
  }

  // Categories and Difficulties
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  getDifficulties(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/difficulties`);
  }


} 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  category: {
    id: string;
    name: string;
  };
  difficulty: {
    id: string;
    name: string;
  };
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    enrollments: number;
    modules: number;
    reviews?: number;
  };
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in minutes
  totalClasses: number;
  completedClasses: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  type: 'VIDEO' | 'LIVE' | 'DOCUMENT' | 'QUIZ' | 'ASSIGNMENT';
  duration: number; // in minutes
  videoUrl?: string;
  documentUrl?: string;
  isFree: boolean;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrollmentDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'COMPLETED';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  amount: number;
  currency: string;
  progress: number; // percentage
  lastActivityDate: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  certificateEarned: boolean;
  isFavorite: boolean;
  totalStudyTime: number; // in minutes
}

export interface CourseReview {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
}

export interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  pendingApproval: number;
  totalEnrollments: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  featuredCourses: number;
  popularCourses: number;
  newCourses: number;
}

export interface CourseCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  courseCount: number;
}

export interface CourseFilter {
  category?: string;
  level?: string;
  priceRange?: { min: number; max: number };
  rating?: number;
  status?: string;
  instructor?: string;
  tags?: string[];
  language?: string;
  duration?: { min: number; max: number };
}

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private apiUrl = 'http://localhost:3000/api/v1'; // Backend API URL with v1 prefix

  constructor(private http: HttpClient) { }

  // Course Management
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses`);
  }

  getCourseById(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/courses/${id}`);
  }

  getCourseDetails(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/courses/${id}/details`);
  }

  getCoursesByInstructor(instructorId: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses/instructor/${instructorId}`);
  }

  getMyCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses/my-courses`);
  }

  getEnrolledCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/courses/enrolled`);
  }

  getPublicCourses(category?: string, difficulty?: string): Observable<Course[]> {
    let url = `${this.apiUrl}/courses/public`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    if (params.toString()) url += `?${params.toString()}`;
    return this.http.get<Course[]>(url);
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

  searchCourses(query: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses/search?q=${encodeURIComponent(query)}`);
  }

  getCoursesByCategory(categoryId: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses/category/${categoryId}`);
  }

  getCoursesByDifficulty(difficultyId: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses/difficulty/${difficultyId}`);
  }

  // Course Approval
  submitForApproval(id: string): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}/courses/${id}/submit-approval`, {});
  }

  approveCourse(id: string): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}/courses/${id}/approve`, {});
  }

  rejectCourse(id: string, reason: string): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}/courses/${id}/reject`, { reason });
  }

  // Module Management
  getModules(courseId: string): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.apiUrl}/courses/${courseId}/modules`);
  }

  getModuleById(id: string): Observable<Module> {
    return this.http.get<Module>(`${this.apiUrl}/modules/${id}`);
  }

  createModule(module: Partial<Module>): Observable<Module> {
    // Extract courseId from the module object
    const { courseId, ...moduleData } = module;
    return this.http.post<Module>(`${this.apiUrl}/courses/${courseId}/modules`, moduleData);
  }

  updateModule(id: string, module: Partial<Module>): Observable<Module> {
    return this.http.patch<Module>(`${this.apiUrl}/modules/${id}`, module);
  }

  deleteModule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/modules/${id}`);
  }

  // Class Management
  getClasses(moduleId: string): Observable<Class[]> {
    return this.http.get<Class[]>(`${this.apiUrl}/modules/${moduleId}/classes`);
  }

  getClassById(id: string): Observable<Class> {
    return this.http.get<Class>(`${this.apiUrl}/classes/${id}`);
  }

  createClass(classData: Partial<Class>): Observable<Class> {
    return this.http.post<Class>(`${this.apiUrl}/classes`, classData);
  }

  updateClass(id: string, classData: Partial<Class>): Observable<Class> {
    return this.http.patch<Class>(`${this.apiUrl}/classes/${id}`, classData);
  }

  deleteClass(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/classes/${id}`);
  }

  // Enrollment Management
  getCourseEnrollments(courseId: string): Observable<CourseEnrollment[]> {
    return this.http.get<CourseEnrollment[]>(`${this.apiUrl}/courses/${courseId}/enrollments`);
  }

  enrollInCourse(enrollment: Partial<CourseEnrollment>): Observable<CourseEnrollment> {
    return this.http.post<CourseEnrollment>(`${this.apiUrl}/enrollments`, enrollment);
  }

  approveEnrollment(id: string): Observable<CourseEnrollment> {
    return this.http.patch<CourseEnrollment>(`${this.apiUrl}/enrollments/${id}/approve`, {});
  }

  rejectEnrollment(id: string, reason: string): Observable<CourseEnrollment> {
    return this.http.patch<CourseEnrollment>(`${this.apiUrl}/enrollments/${id}/reject`, { reason });
  }

  // Review Management
  getCourseReviews(courseId: string): Observable<CourseReview[]> {
    return this.http.get<CourseReview[]>(`${this.apiUrl}/courses/${courseId}/reviews`);
  }

  createReview(review: Partial<CourseReview>): Observable<CourseReview> {
    return this.http.post<CourseReview>(`${this.apiUrl}/reviews`, review);
  }

  updateReview(id: string, review: Partial<CourseReview>): Observable<CourseReview> {
    return this.http.patch<CourseReview>(`${this.apiUrl}/reviews/${id}`, review);
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${id}`);
  }

  // Category Management
  getCategories(): Observable<CourseCategory[]> {
    return this.http.get<CourseCategory[]>(`${this.apiUrl}/categories`);
  }

  createCategory(category: Partial<CourseCategory>): Observable<CourseCategory> {
    return this.http.post<CourseCategory>(`${this.apiUrl}/categories`, category);
  }

  updateCategory(id: string, category: Partial<CourseCategory>): Observable<CourseCategory> {
    return this.http.patch<CourseCategory>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  // Difficulty Management
  getDifficultyLevels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/difficulties`);
  }

  createDifficultyLevel(difficulty: { name: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/difficulties`, difficulty);
  }

  updateDifficultyLevel(id: string, difficulty: { name: string }): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/difficulties/${id}`, difficulty);
  }

  deleteDifficultyLevel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/difficulties/${id}`);
  }

  // Analytics and Stats
  getCourseStats(): Observable<CourseStats> {
    return this.http.get<CourseStats>(`${this.apiUrl}/courses/stats`);
  }

  // Search with filters
  searchCoursesWithFilters(query: string, filters?: CourseFilter): Observable<Course[]> {
    let url = `${this.apiUrl}/courses/search?q=${encodeURIComponent(query)}`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.instructor) params.append('instructor', filters.instructor);
      if (filters.language) params.append('language', filters.language);
      if (filters.priceRange) {
        params.append('minPrice', filters.priceRange.min.toString());
        params.append('maxPrice', filters.priceRange.max.toString());
      }
      if (filters.duration) {
        params.append('minDuration', filters.duration.min.toString());
        params.append('maxDuration', filters.duration.max.toString());
      }
      if (params.toString()) url += `&${params.toString()}`;
    }
    return this.http.get<Course[]>(url);
  }

  // Legacy methods for backward compatibility - these will be removed once all components are updated
  publishCourse(id: string): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}/courses/${id}/publish`, {});
  }

  archiveCourse(id: string): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}/courses/${id}/archive`, {});
  }
} 
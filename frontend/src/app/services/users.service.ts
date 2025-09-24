import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalCourses?: number;
  totalEnrollments?: number;
  totalRevenue?: number;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  students: number;
  instructors: number;
  admins: number;
  newUsersThisMonth: number;
  verifiedUsers: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:3000/api/v1'; // Backend API URL with v1 prefix

  constructor(private http: HttpClient) {}

  // User Management
  getUsers(filters?: UserFilters): Observable<User[]> {
    let url = `${this.apiUrl}/users`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (params.toString()) url += `?${params.toString()}`;
    }
    return this.http.get<User[]>(url);
  }

  getUserById(id: string): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/profile`);
  }

  getEnrolledCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/enrolled-courses`);
  }

  getInstructorCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/instructor-courses`);
  }

  createUser(userData: Omit<User, 'id' | 'joinDate' | 'lastLogin'>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData);
  }

  updateUser(id: string, updates: Partial<User>): Observable<User | null> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}`, updates);
  }

  deleteUser(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/users/${id}`);
  }

  toggleUserStatus(id: string): Observable<User | null> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/toggle-status`, {});
  }

  suspendUser(id: string): Observable<User | null> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/suspend`, {});
  }

  verifyUser(id: string): Observable<User | null> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/verify`, {});
  }

  // Analytics
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/users/stats`);
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users?search=${encodeURIComponent(query)}`);
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users?role=${role}`);
  }

  getUsersByStatus(status: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users?status=${status}`);
  }

  updateLastLogin(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/users/${id}/last-login`, {});
  }

  // Bulk Operations
  bulkUpdateUsers(updates: { id: string; updates: Partial<User> }[]): Observable<User[]> {
    return this.http.patch<User[]>(`${this.apiUrl}/users/bulk-update`, { updates });
  }

  // Export
  exportUsers(format: 'csv' | 'json'): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/users/export?format=${format}`);
  }
} 
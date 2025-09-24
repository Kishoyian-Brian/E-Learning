import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // Accept any string to allow lowercase normalization
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  agreeToTerms: boolean;
  agreeToMarketing?: boolean;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  message?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'facebook' | 'github';
  token: string;
}

export interface SessionInfo {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  expiresAt: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  private readonly API_BASE_URL = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  // Observable streams
  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  get token$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  // Current values
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  // Get token method for interceptors
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  // Initialize authentication state
  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    console.log('[AuthService] initializeAuth: token', token, 'user', user);
    if (token && user && !this.isTokenExpired(token)) {
      this.setAuthState(user, token);
      // Removed getProfile() call to avoid circular dependency
    } else {
      this.clearAuthState();
      this.clearStoredAuthData();
    }
  }

  // Login
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/auth/login`, {
      email: credentials.email,
      password: credentials.password
    }).pipe(
      tap(response => {
        this.setAuthState(response.user, response.access_token);
        this.storeAuthData(response); // Always persist auth data!
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }

  // Register
  register(data: RegisterData): Observable<AuthResponse> {
    // Validate password match
    if (data.password !== data.confirmPassword) {
      return throwError(() => new Error('Passwords do not match'));
    }

    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/auth/register`, {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role
    }).pipe(
      tap(response => {
        // Note: Registration doesn't automatically log in the user
        // They need to verify their email first
        console.log('Registration successful:', response.message);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error(error.error?.message || 'Registration failed'));
      })
    );
  }

  // Verify email
  verifyEmail(email: string, code: string): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/auth/verify-email`, {
      email,
      code
    }).pipe(
      catchError(error => {
        console.error('Email verification error:', error);
        return throwError(() => new Error(error.error?.message || 'Email verification failed'));
      })
    );
  }

  // Resend verification email
  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/auth/resend-verification`, {
      email
    }).pipe(
      catchError(error => {
        console.error('Resend verification error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to resend verification email'));
      })
    );
  }

  // Logout
  logout(): Observable<void> {
    return this.http.post<void>(`${this.API_BASE_URL}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearAuthState();
        this.clearStoredAuthData();
      }),
      catchError(error => {
        // Even if logout fails on server, clear local state
        this.clearAuthState();
        this.clearStoredAuthData();
        return of(void 0);
      })
    );
  }

  // Get user profile
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_BASE_URL}/auth/profile`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Get profile error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to get profile'));
      })
    );
  }

  // Password reset request
  requestPasswordReset(request: PasswordResetRequest): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/auth/forgot-password`, {
      email: request.email
    }).pipe(
      catchError(error => {
        console.error('Password reset request error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to send password reset email'));
      })
    );
  }

  // Confirm password reset
  confirmPasswordReset(confirm: PasswordResetConfirm): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/auth/reset-password`, {
      token: confirm.token,
      newPassword: confirm.newPassword
    }).pipe(
      catchError(error => {
        console.error('Password reset confirmation error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to reset password'));
      })
    );
  }

  // Change password
  changePassword(request: ChangePasswordRequest): Observable<any> {
    if (!this.isAuthenticated) {
      return throwError(() => new Error('User not authenticated'));
    }

    if (request.newPassword !== request.confirmPassword) {
      return throwError(() => new Error('New passwords do not match'));
    }

    // Note: This endpoint doesn't exist in your backend yet
    // You'll need to create it
    return throwError(() => new Error('Change password endpoint not implemented'));
  }

  // Social login (not implemented in backend yet)
  socialLogin(request: SocialLoginRequest): Observable<AuthResponse> {
    return throwError(() => new Error('Social login not implemented'));
  }

  // Update user profile
  updateProfile(updates: Partial<User>): Observable<User> {
    if (!this.isAuthenticated) {
      return throwError(() => new Error('User not authenticated'));
    }

    const currentUser = this.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('No current user'));
    }

    return this.http.patch<User>(`${this.API_BASE_URL}/users/${currentUser.id}`, updates).pipe(
      tap(updatedUser => {
        this.currentUserSubject.next(updatedUser);
      }),
      catchError(error => {
        console.error('Update profile error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to update profile'));
      })
    );
  }

  // Update preferences (not implemented in backend yet)
  updatePreferences(preferences: Partial<UserPreferences>): Observable<User> {
    return throwError(() => new Error('Preferences update not implemented'));
  }

  // Role checking methods
  hasRole(role: string): boolean {
    const user = this.currentUser;
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser;
    return user ? roles.includes(user.role) : false;
  }

  // Get session info
  getSessionInfo(): SessionInfo {
    return {
      isAuthenticated: this.isAuthenticated,
      user: this.currentUser,
      token: this.token,
      expiresAt: this.getTokenExpiration()
    };
  }

  // Private helper methods
  private setAuthState(user: User, token: string): void {
    // Normalize role to lowercase for frontend checks
    const normalizedUser = { ...user, role: user.role.toLowerCase() };
    this.currentUserSubject.next(normalizedUser);
    this.tokenSubject.next(token);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthState(): void {
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private getTokenExpiration(): Date | null {
    const token = this.token;
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }

  private storeAuthData(response: AuthResponse): void {
    const normalizedUser = { ...response.user, role: response.user.role.toLowerCase() };
    localStorage.setItem('auth_token', response.access_token);
    localStorage.setItem('auth_user', JSON.stringify(normalizedUser));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private clearStoredAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
} 
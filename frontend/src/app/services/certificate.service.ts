import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
// Environment configuration
const environment = {
  apiUrl: 'http://localhost:3000/api/v1'
};

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  issuedAt: Date;
  url: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  certificateNumber: string;
  grade?: string;
  completionDate?: Date;
  instructorName?: string;
  validUntil?: Date;
}

export interface CertificateStats {
  totalIssued: number;
  totalPending: number;
  totalExpired: number;
  totalRevoked: number;
  monthlyIssued: number;
  averageCompletionTime: number;
}

export interface CertificateRequest {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  requestedAt: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: Date;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private apiUrl = `${environment.apiUrl}/certificates`;

  constructor(private http: HttpClient) {}

  // Get all certificates (admin only)
  getAllCertificates(): Observable<Certificate[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(certificates => certificates.map(cert => this.mapCertificate(cert))),
      catchError(error => {
        console.error('Error fetching certificates:', error);
        return of([]);
      })
    );
  }

  // Get user's certificates
  getMyCertificates(): Observable<Certificate[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-certificates`).pipe(
      map(certificates => certificates.map(cert => this.mapCertificate(cert))),
      catchError(error => {
        console.error('Error fetching my certificates:', error);
        return of([]);
      })
    );
  }

  // Get single certificate
  getCertificate(id: string): Observable<Certificate> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(cert => this.mapCertificate(cert)),
      catchError(error => {
        console.error('Error fetching certificate:', error);
        throw error;
      })
    );
  }

  // Verify certificate
  verifyCertificate(verificationCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify/${verificationCode}`).pipe(
      catchError(error => {
        console.error('Error verifying certificate:', error);
        throw error;
      })
    );
  }

  // Generate certificate for course completion
  generateCertificateForCompletion(enrollmentId: string): Observable<Certificate> {
    return this.http.post<any>(`${this.apiUrl}/generate-for-completion/${enrollmentId}`, {}).pipe(
      map(cert => this.mapCertificate(cert)),
      catchError(error => {
        console.error('Error generating certificate:', error);
        throw error;
      })
    );
  }

  // Create certificate (instructor/admin only)
  createCertificate(certificateData: any): Observable<Certificate> {
    return this.http.post<any>(this.apiUrl, certificateData).pipe(
      map(cert => this.mapCertificate(cert)),
      catchError(error => {
        console.error('Error creating certificate:', error);
        throw error;
      })
    );
  }

  // Revoke certificate (instructor/admin only)
  revokeCertificate(id: string): Observable<Certificate> {
    return this.http.post<any>(`${this.apiUrl}/${id}/revoke`, {}).pipe(
      map(cert => this.mapCertificate(cert)),
      catchError(error => {
        console.error('Error revoking certificate:', error);
        throw error;
      })
    );
  }

  // Download certificate
  downloadCertificate(fileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${fileName}`, { responseType: 'blob' }).pipe(
      catchError(error => {
        console.error('Error downloading certificate:', error);
        throw error;
      })
    );
  }

  // Get certificate statistics (admin only)
  getCertificateStats(): Observable<CertificateStats> {
    // This endpoint doesn't exist yet, so we'll calculate from certificates
    return this.getAllCertificates().pipe(
      map(certificates => this.calculateStats(certificates))
    );
  }

  // Get certificate requests (admin only)
  getCertificateRequests(): Observable<CertificateRequest[]> {
    // This endpoint doesn't exist yet, return empty array
    return of([]);
  }

  // Helper method to map backend certificate to frontend interface
  private mapCertificate(cert: any): Certificate {
    return {
      id: cert.id,
      userId: cert.userId,
      userName: cert.user?.name || 'Unknown User',
      courseId: cert.courseId,
      courseTitle: cert.course?.title || 'Unknown Course',
      issuedAt: new Date(cert.issuedAt),
      url: cert.certificateUrl || '',
      status: cert.status,
      certificateNumber: cert.certificateNumber,
      grade: cert.metadata?.grade,
      completionDate: cert.issuedAt ? new Date(cert.issuedAt) : undefined,
      instructorName: cert.course?.instructor?.name,
      validUntil: cert.expiresAt ? new Date(cert.expiresAt) : undefined
    };
  }

  // Helper method to calculate statistics
  private calculateStats(certificates: Certificate[]): CertificateStats {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalIssued = certificates.length;
    const totalPending = 0; // PENDING status not used in current certificate model
    const totalExpired = certificates.filter(c => c.status === 'EXPIRED').length;
    const totalRevoked = certificates.filter(c => c.status === 'REVOKED').length;
    const monthlyIssued = certificates.filter(c => new Date(c.issuedAt) >= thisMonth).length;
    
    // Calculate average completion time (placeholder)
    const averageCompletionTime = 45; // days

    return {
      totalIssued,
      totalPending,
      totalExpired,
      totalRevoked,
      monthlyIssued,
      averageCompletionTime
    };
  }
} 
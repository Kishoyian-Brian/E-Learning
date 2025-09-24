import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificateService, Certificate, CertificateRequest, CertificateStats } from '../../services/certificate.service';
import { NotificationService } from '../../services/notification.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificate.html',
  styleUrl: './certificate.css'
})
export class CertificateComponent implements OnInit {
  certificates: Certificate[] = [];
  requests: CertificateRequest[] = [];
  stats: CertificateStats | null = null;
  loading = true;
  selectedTab = 'certificates';
  searchTerm = '';
  selectedStatus = 'all';
  verificationNumber = '';
  completedCourses: Set<string> = new Set();

  constructor(
    private certificateService: CertificateService,
    private notificationService: NotificationService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.loadCertificateData();
    this.loadCompletedCourses();
  }

  loadCertificateData(): void {
    this.loading = true;
    
    // Load certificates
    this.certificateService.getMyCertificates().subscribe({
      next: (certificates) => {
        this.certificates = certificates;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading certificates:', error);
        this.loading = false;
      }
    });

    // Load certificate stats
    this.certificateService.getCertificateStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading certificate stats:', error);
      }
    });

    // Load certificate requests (admin only)
    this.certificateService.getCertificateRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
      },
      error: (error) => {
        console.error('Error loading certificate requests:', error);
      }
    });
  }

  loadCompletedCourses(): void {
    // Fetch all progress records and mark completed courses
    this.progressService.findByUser().subscribe(progressRecords => {
      // Find completed progress records for enrollments
      const completedEnrollmentIds = progressRecords.filter(p => p.completed && !p.moduleId).map(p => p.enrollmentId);
      // Map enrollmentId to courseId using certificates
      this.certificates.forEach(cert => {
        if (completedEnrollmentIds.includes(cert.id)) {
          this.completedCourses.add(cert.courseId);
        }
      });
    });
  }

  canDownloadCertificate(certificate: Certificate): boolean {
    // Only allow download if the course is completed
    return this.completedCourses.has(certificate.courseId);
  }

  switchTab(tab: string): void {
    this.selectedTab = tab;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-500 bg-green-100';
      case 'EXPIRED':
        return 'text-yellow-500 bg-yellow-100';
      case 'REVOKED':
        return 'text-red-500 bg-red-100';
      case 'PENDING':
        return 'text-blue-500 bg-blue-100';
      case 'APPROVED':
        return 'text-green-500 bg-green-100';
      case 'REJECTED':
        return 'text-red-500 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'fas fa-check-circle';
      case 'EXPIRED':
        return 'fas fa-clock';
      case 'REVOKED':
        return 'fas fa-ban';
      case 'PENDING':
        return 'fas fa-hourglass-half';
      case 'APPROVED':
        return 'fas fa-check-circle';
      case 'REJECTED':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  downloadCertificate(certificate: Certificate): void {
    if (certificate.url) {
      // Extract filename from URL
      const fileName = certificate.url.split('/').pop() || certificate.certificateNumber;
      this.certificateService.downloadCertificate(fileName).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${certificate.certificateNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          this.notificationService.showSuccess('Certificate Downloaded', 'Your certificate has been downloaded successfully!');
        },
        error: (error) => {
          console.error('Error downloading certificate:', error);
          this.notificationService.showError('Download Failed', 'Failed to download certificate. Please try again or contact support.');
        }
      });
    } else {
      this.notificationService.showError('No Certificate File', 'Certificate file not available for download.');
    }
  }

  viewCertificate(certificate: Certificate): void {
    if (certificate.url) {
      window.open(certificate.url, '_blank');
    }
  }

  revokeCertificate(certificate: Certificate): void {
    if (confirm(`Are you sure you want to revoke certificate ${certificate.certificateNumber}?`)) {
      this.certificateService.revokeCertificate(certificate.id).subscribe({
        next: (updatedCertificate) => {
          // Update the certificate in the list
          const index = this.certificates.findIndex(c => c.id === certificate.id);
          if (index !== -1) {
            this.certificates[index] = updatedCertificate;
          }
        },
        error: (error) => {
          console.error('Error revoking certificate:', error);
        }
      });
    }
  }

  approveRequest(request: CertificateRequest): void {
    // TODO: Implement request approval when backend endpoint is available
    console.log('Approving request:', request.id);
  }

  rejectRequest(request: CertificateRequest): void {
    // TODO: Implement request rejection when backend endpoint is available
    console.log('Rejecting request:', request.id);
  }

  verifyCertificate(): void {
    if (this.verificationNumber.trim()) {
      this.certificateService.verifyCertificate(this.verificationNumber).subscribe({
        next: (result) => {
          if (result.isValid) {
            alert('Certificate is valid!');
          } else {
            alert(`Certificate verification failed: ${result.reason}`);
          }
        },
        error: (error) => {
          console.error('Error verifying certificate:', error);
          alert('Error verifying certificate');
        }
      });
    }
  }

  getFilteredCertificates(): Certificate[] {
    let filtered = this.certificates;

    if (this.searchTerm) {
      filtered = filtered.filter(cert => 
        cert.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cert.courseTitle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cert.certificateNumber.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(cert => cert.status === this.selectedStatus);
    }

    return filtered;
  }

  getFilteredRequests(): CertificateRequest[] {
    let filtered = this.requests;

    if (this.searchTerm) {
      filtered = filtered.filter(req => 
        req.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        req.courseTitle.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(req => req.status === this.selectedStatus);
    }

    return filtered;
  }

  getActiveCertificates(): Certificate[] {
    return this.certificates.filter(cert => cert.status === 'ACTIVE');
  }

  getExpiredCertificates(): Certificate[] {
    return this.certificates.filter(cert => cert.status === 'EXPIRED');
  }

  getRevokedCertificates(): Certificate[] {
    return this.certificates.filter(cert => cert.status === 'REVOKED');
  }

  getPendingRequests(): CertificateRequest[] {
    return this.requests.filter(req => req.status === 'PENDING');
  }

  isCertificateExpired(certificate: Certificate): boolean {
    if (!certificate.validUntil) return false;
    return new Date() > new Date(certificate.validUntil);
  }

  getDaysUntilExpiry(certificate: Certificate): number {
    if (!certificate.validUntil) return -1;
    const today = new Date();
    const expiryDate = new Date(certificate.validUntil);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getExpiryStatus(certificate: Certificate): string {
    if (!certificate.validUntil) return 'No expiry date';
    
    const daysUntilExpiry = this.getDaysUntilExpiry(certificate);
    
    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry <= 30) return 'Expiring soon';
    if (daysUntilExpiry <= 90) return 'Expiring in 3 months';
    return 'Valid';
  }

  getExpiryColor(certificate: Certificate): string {
    const daysUntilExpiry = this.getDaysUntilExpiry(certificate);
    
    if (daysUntilExpiry < 0) return 'text-red-500';
    if (daysUntilExpiry <= 30) return 'text-yellow-500';
    if (daysUntilExpiry <= 90) return 'text-orange-500';
    return 'text-green-500';
  }
}

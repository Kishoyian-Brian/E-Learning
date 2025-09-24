import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnrollmentService, Enrollment, EnrollmentApplication, EnrollmentStats, CourseEnrollmentData, StudentEnrollmentHistory } from '../../services/enrollment.service';

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enrollment.html',
  styleUrl: './enrollment.css'
})
export class EnrollmentComponent implements OnInit {
  enrollments: Enrollment[] = [];
  applications: EnrollmentApplication[] = [];
  stats: EnrollmentStats | null = null;
  courseEnrollmentData: CourseEnrollmentData[] = [];
  loading = true;
  selectedTab = 'enrollments';
  selectedEnrollment: Enrollment | null = null;
  selectedApplication: EnrollmentApplication | null = null;
  isViewingEnrollment = false;
  isViewingApplication = false;
  isProcessingApplication = false;
  searchTerm = '';
  selectedStatus = 'all';
  selectedCourse = 'all';
  selectedPaymentStatus = 'all';
  rejectionReason = '';

  constructor(private enrollmentService: EnrollmentService) {}

  ngOnInit(): void {
    this.loadEnrollmentData();
  }

  loadEnrollmentData(): void {
    // Using mock data for development
    this.loading = true;
    
    // Load enrollments
    this.enrollmentService.getEnrollments().subscribe({
      next: (enrollments) => {
        this.enrollments = enrollments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading enrollments:', error);
        this.loading = false;
      }
    });

    // Load enrollment stats
    this.enrollmentService.getEnrollmentStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading enrollment stats:', error);
      }
    });

    // Load course enrollment data
    this.enrollmentService.getCourseEnrollmentData('course1').subscribe({
      next: (data) => {
        this.courseEnrollmentData = [data];
      },
      error: (error) => {
        console.error('Error loading course enrollment data:', error);
      }
    });
    this.loading = false;
  }

  switchTab(tab: string): void {
    this.selectedTab = tab;
    this.resetForms();
  }

  resetForms(): void {
    this.isViewingEnrollment = false;
    this.isViewingApplication = false;
    this.isProcessingApplication = false;
    this.selectedEnrollment = null;
    this.selectedApplication = null;
    this.rejectionReason = '';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-500 bg-green-100';
      case 'COMPLETED':
        return 'text-blue-500 bg-blue-100';
      case 'DROPPED':
        return 'text-red-500 bg-red-100';
      case 'PENDING':
        return 'text-yellow-500 bg-yellow-100';
      case 'WAITLISTED':
        return 'text-purple-500 bg-purple-100';
      case 'REJECTED':
        return 'text-red-500 bg-red-100';
      case 'APPROVED':
        return 'text-green-500 bg-green-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'fas fa-play-circle';
      case 'COMPLETED':
        return 'fas fa-check-circle';
      case 'DROPPED':
        return 'fas fa-times-circle';
      case 'PENDING':
        return 'fas fa-clock';
      case 'WAITLISTED':
        return 'fas fa-hourglass-half';
      case 'REJECTED':
        return 'fas fa-ban';
      case 'APPROVED':
        return 'fas fa-check-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'PAID':
        return 'text-green-500 bg-green-100';
      case 'PENDING':
        return 'text-yellow-500 bg-yellow-100';
      case 'FAILED':
        return 'text-red-500 bg-red-100';
      case 'REFUNDED':
        return 'text-gray-500 bg-gray-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  viewEnrollment(enrollment: Enrollment): void {
    this.selectedEnrollment = enrollment;
    this.isViewingEnrollment = true;
  }

  viewApplication(application: EnrollmentApplication): void {
    this.selectedApplication = application;
    this.isViewingApplication = true;
  }

  approveApplication(application: EnrollmentApplication): void {
    // TODO: Implement application approval
    console.log('Approving application:', application.id);
    this.isProcessingApplication = true;
  }

  rejectApplication(application: EnrollmentApplication): void {
    if (this.rejectionReason.trim()) {
      // TODO: Implement application rejection
      console.log('Rejecting application:', application.id, 'Reason:', this.rejectionReason);
      this.isProcessingApplication = true;
    }
  }

  waitlistApplication(application: EnrollmentApplication): void {
    // TODO: Implement application waitlisting
    console.log('Waitlisting application:', application.id);
    this.isProcessingApplication = true;
  }

  dropEnrollment(enrollment: Enrollment): void {
    if (confirm(`Are you sure you want to drop ${enrollment.studentName} from ${enrollment.courseTitle}?`)) {
      // TODO: Implement enrollment dropping
      console.log('Dropping enrollment:', enrollment.id);
    }
  }

  completeEnrollment(enrollment: Enrollment): void {
    if (confirm(`Mark ${enrollment.studentName} as completed for ${enrollment.courseTitle}?`)) {
      // TODO: Implement enrollment completion
      console.log('Completing enrollment:', enrollment.id);
    }
  }

  getFilteredEnrollments(): Enrollment[] {
    let filtered = this.enrollments;

    if (this.searchTerm) {
      filtered = filtered.filter(enrollment => 
        enrollment.studentName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        enrollment.courseTitle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        enrollment.studentEmail.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.status === this.selectedStatus);
    }

    if (this.selectedCourse !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.courseId === this.selectedCourse);
    }

    if (this.selectedPaymentStatus !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.paymentStatus === this.selectedPaymentStatus);
    }

    return filtered;
  }

  getFilteredApplications(): EnrollmentApplication[] {
    let filtered = this.applications;

    if (this.searchTerm) {
      filtered = filtered.filter(application => 
        application.studentName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        application.courseTitle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        application.studentEmail.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(application => application.status === this.selectedStatus);
    }

    if (this.selectedCourse !== 'all') {
      filtered = filtered.filter(application => application.courseId === this.selectedCourse);
    }

    return filtered;
  }

  getActiveEnrollments(): Enrollment[] {
    return this.enrollments.filter(enrollment => enrollment.status === 'ACTIVE');
  }

  getCompletedEnrollments(): Enrollment[] {
    return this.enrollments.filter(enrollment => enrollment.status === 'COMPLETED');
  }

  getDroppedEnrollments(): Enrollment[] {
    return this.enrollments.filter(enrollment => enrollment.status === 'DROPPED');
  }

  getPendingApplications(): EnrollmentApplication[] {
    return this.applications.filter(application => application.status === 'PENDING');
  }

  getApprovedApplications(): EnrollmentApplication[] {
    return this.applications.filter(application => application.status === 'APPROVED');
  }

  getRejectedApplications(): EnrollmentApplication[] {
    return this.applications.filter(application => application.status === 'REJECTED');
  }

  getWaitlistedApplications(): EnrollmentApplication[] {
    return this.applications.filter(application => application.status === 'WAITLISTED');
  }

  getEnrollmentProgressColor(progress: number): string {
    if (progress >= 80) return 'text-green-500';
    if (progress >= 60) return 'text-blue-500';
    if (progress >= 40) return 'text-yellow-500';
    return 'text-red-500';
  }

  getGradeColor(grade: string): string {
    const gradeNum = parseFloat(grade);
    if (gradeNum >= 90) return 'text-green-500';
    if (gradeNum >= 80) return 'text-blue-500';
    if (gradeNum >= 70) return 'text-yellow-500';
    if (gradeNum >= 60) return 'text-orange-500';
    return 'text-red-500';
  }

  getProgressBarColor(progress: number): string {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getDaysSinceEnrollment(enrollmentDate: Date): number {
    const now = new Date();
    const enrollment = new Date(enrollmentDate);
    const diffTime = now.getTime() - enrollment.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysSinceLastActivity(lastActivityDate: Date): number {
    const now = new Date();
    const lastActivity = new Date(lastActivityDate);
    const diffTime = now.getTime() - lastActivity.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getActivityStatus(lastActivityDate: Date): string {
    const days = this.getDaysSinceLastActivity(lastActivityDate);
    if (days <= 1) return 'Active today';
    if (days <= 7) return `Active ${days} days ago`;
    if (days <= 30) return `Active ${Math.floor(days / 7)} weeks ago`;
    return `Inactive ${Math.floor(days / 30)} months ago`;
  }

  getActivityColor(lastActivityDate: Date): string {
    const days = this.getDaysSinceLastActivity(lastActivityDate);
    if (days <= 1) return 'text-green-500';
    if (days <= 7) return 'text-blue-500';
    if (days <= 30) return 'text-yellow-500';
    return 'text-red-500';
  }

  getTopCourses(): { courseId: string; courseTitle: string; enrollments: number }[] {
    return this.stats?.topCourses || [];
  }

  getTotalRevenue(): number {
    return this.enrollments
      .filter(enrollment => enrollment.paymentStatus === 'PAID')
      .reduce((total, enrollment) => total + enrollment.amount, 0);
  }

  getAverageProgress(): number {
    const activeEnrollments = this.getActiveEnrollments();
    if (activeEnrollments.length === 0) return 0;
    const totalProgress = activeEnrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0);
    return Math.round(totalProgress / activeEnrollments.length);
  }

  getCompletionRate(): number {
    const totalEnrollments = this.enrollments.length;
    const completedEnrollments = this.getCompletedEnrollments().length;
    return totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
  }

  exportEnrollmentData(): void {
    // TODO: Implement data export
    console.log('Exporting enrollment data...');
  }

  bulkApproveApplications(): void {
    const pendingApplications = this.getPendingApplications();
    if (pendingApplications.length > 0) {
      const applicationIds = pendingApplications.map(app => app.id);
      // TODO: Implement bulk approval
      console.log('Bulk approving applications:', applicationIds);
    }
  }

  bulkRejectApplications(): void {
    const pendingApplications = this.getPendingApplications();
    if (pendingApplications.length > 0 && this.rejectionReason.trim()) {
      const applicationIds = pendingApplications.map(app => app.id);
      // TODO: Implement bulk rejection
      console.log('Bulk rejecting applications:', applicationIds, 'Reason:', this.rejectionReason);
    }
  }

  getCourseById(courseId: string): CourseEnrollmentData | undefined {
    return this.courseEnrollmentData.find(course => course.courseId === courseId);
  }

  getEnrollmentTrendData(courseId: string): { month: string; enrollments: number }[] {
    const course = this.getCourseById(courseId);
    return course?.enrollmentTrend || [];
  }

  getEnrollmentTrendLabels(courseId: string): string[] {
    return this.getEnrollmentTrendData(courseId).map(item => item.month);
  }

  getEnrollmentTrendValues(courseId: string): number[] {
    return this.getEnrollmentTrendData(courseId).map(item => item.enrollments);
  }

  getCourseProgressPercentage(enrollments: number): number {
    const topCourses = this.getTopCourses();
    if (topCourses.length === 0) return 0;
    const maxEnrollments = Math.max(...topCourses.map(c => c.enrollments));
    return maxEnrollments > 0 ? (enrollments / maxEnrollments) * 100 : 0;
  }
}

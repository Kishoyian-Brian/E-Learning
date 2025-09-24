import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesService, Course, CourseEnrollment } from '../../services/courses.service';
import { ProgressService, CourseProgress } from '../../services/progress.service';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { CertificateService } from '../../services/certificate.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-mycourses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mycourses.html',
  styleUrl: './mycourses.css'
})
export class Mycourses implements OnInit {
  enrolledCourses: Course[] = [];
  enrollments: CourseEnrollment[] = [];
  loading = true;
  selectedTab = 'all-courses';
  searchTerm = '';
  selectedStatus = 'all';
  selectedProgress = 'all';

  constructor(
    private coursesService: CoursesService,
    private progressService: ProgressService,
    private authService: AuthService,
    private router: Router,
    private certificateService: CertificateService,
    private notificationService: NotificationService
  ) {
    // Auto-refresh on navigation to /mycourses
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd && event.url === '/mycourses')
    ).subscribe(() => {
      this.loadMyCourses();
    });
  }

  ngOnInit(): void {
    this.loadMyCourses();
  }

  loadMyCourses(): void {
    this.loading = true;
    
    this.coursesService.getEnrolledCourses().subscribe({
      next: (coursesWithEnrollments: any[]) => {
        // Extract courses and enrollments from the response
        this.enrolledCourses = coursesWithEnrollments.map(courseWithEnrollment => ({
          id: courseWithEnrollment.id,
          title: courseWithEnrollment.title,
          description: courseWithEnrollment.description,
          instructorId: courseWithEnrollment.instructorId,
          category: courseWithEnrollment.category,
          difficulty: courseWithEnrollment.difficulty,
          instructor: courseWithEnrollment.instructor,
          createdAt: new Date(courseWithEnrollment.createdAt),
          updatedAt: new Date(courseWithEnrollment.updatedAt),
          _count: courseWithEnrollment._count
        }));
        
        // Extract enrollments from the courses
        this.enrollments = coursesWithEnrollments.flatMap(courseWithEnrollment => 
          (courseWithEnrollment.enrollments || []).map((enrollment: any) => ({
            id: enrollment.id,
            courseId: enrollment.courseId,
            studentId: enrollment.userId,
            studentName: '',
            studentEmail: '',
            enrollmentDate: new Date(enrollment.enrolledAt),
            status: 'APPROVED',
            paymentStatus: 'PAID' as any,
            amount: 0,
            currency: 'USD',
            progress: this.calculateProgress(enrollment.progress || []),
            lastActivityDate: new Date(),
            lastAccessedAt: new Date(),
            certificateEarned: false,
            isFavorite: false,
            totalStudyTime: 0
          }))
        );
        
        // Load real progress data for each enrollment
        this.loadProgressForEnrollments();
      },
      error: (error) => {
        console.error('Error loading enrolled courses:', error);
        this.loading = false;
      }
    });
  }

  loadProgressForEnrollments(): void {
    if (this.enrollments.length === 0) {
      this.loading = false;
      return;
    }
    const progressObservables = this.enrollments.map(enrollment =>
      this.progressService.getCourseProgress(enrollment.id)
    );
    forkJoin(progressObservables).subscribe({
      next: (progressResults: CourseProgress[]) => {
        this.enrollments.forEach((enrollment, idx) => {
          const progress = progressResults[idx];
          enrollment.progress = progress.overallProgressPercentage;
          if (progress.isCourseCompleted) {
            enrollment.status = 'COMPLETED';
            enrollment.certificateEarned = true;
          }
        });
        this.loading = false;
        },
        error: (error) => {
        console.error('Error loading progress for enrollments:', error);
        this.loading = false;
        }
    });
  }

  private calculateProgress(progressArray: any[]): number {
    if (!progressArray || progressArray.length === 0) return 0;
    const completedModules = progressArray.filter((p: any) => p.completed).length;
    return Math.round((completedModules / progressArray.length) * 100);
  }

  switchTab(tab: string): void {
    this.selectedTab = tab;
  }

  getFilteredCourses(): Course[] {
    let filtered = this.enrolledCourses;

    if (this.searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (course.instructor?.name || '').toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(course => {
        const enrollment = this.getEnrollmentByCourseId(course.id);
        return enrollment?.status === this.selectedStatus;
      });
    }

    if (this.selectedProgress !== 'all') {
      filtered = filtered.filter(course => {
        const enrollment = this.getEnrollmentByCourseId(course.id);
        if (!enrollment) return false;
        
        switch (this.selectedProgress) {
          case 'not-started':
            return enrollment.progress === 0;
          case 'in-progress':
            return enrollment.progress > 0 && enrollment.progress < 100;
          case 'completed':
            return enrollment.progress === 100;
          default:
            return true;
        }
      });
    }

    return filtered;
  }

  getEnrollmentByCourseId(courseId: string): CourseEnrollment | undefined {
    return this.enrollments.find(enrollment => enrollment.courseId === courseId);
  }

  getInProgressCourses(): Course[] {
    return this.enrolledCourses.filter(course => {
      const enrollment = this.getEnrollmentByCourseId(course.id);
      return enrollment && enrollment.progress > 0 && enrollment.progress < 100;
    });
  }

  getCompletedCourses(): Course[] {
    return this.enrolledCourses.filter(course => {
      const enrollment = this.getEnrollmentByCourseId(course.id);
      return enrollment && enrollment.progress === 100;
    });
  }

  getNotStartedCourses(): Course[] {
    return this.enrolledCourses.filter(course => {
      const enrollment = this.getEnrollmentByCourseId(course.id);
      return enrollment && enrollment.progress === 0;
    });
  }

  getFavoriteCourses(): Course[] {
    return this.enrolledCourses.filter(course => {
      const enrollment = this.getEnrollmentByCourseId(course.id);
      return enrollment && enrollment.isFavorite;
    });
  }

  getRecentCourses(): Course[] {
    return this.enrolledCourses
      .sort((a, b) => {
        const enrollmentA = this.getEnrollmentByCourseId(a.id);
        const enrollmentB = this.getEnrollmentByCourseId(b.id);
        if (!enrollmentA || !enrollmentB) return 0;
        return new Date(enrollmentB.lastAccessedAt).getTime() - new Date(enrollmentA.lastAccessedAt).getTime();
      })
      .slice(0, 6);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'text-green-500 bg-green-100';
      case 'PENDING':
        return 'text-yellow-500 bg-yellow-100';
      case 'REJECTED':
        return 'text-red-500 bg-red-100';
      case 'WAITLISTED':
        return 'text-purple-500 bg-purple-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'fas fa-check-circle';
      case 'PENDING':
        return 'fas fa-clock';
      case 'REJECTED':
        return 'fas fa-ban';
      case 'WAITLISTED':
        return 'fas fa-hourglass-half';
      default:
        return 'fas fa-question-circle';
    }
  }

  getDifficultyColor(difficultyName: string): string {
    switch (difficultyName.toLowerCase()) {
      case 'beginner':
        return 'text-green-500 bg-green-100';
      case 'intermediate':
        return 'text-yellow-500 bg-yellow-100';
      case 'advanced':
        return 'text-red-500 bg-red-100';
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

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'text-green-500';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-red-500';
  }

  getProgressBarColor(progress: number): string {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getProgressLabel(progress: number): string {
    if (progress === 0) return 'Not Started';
    if (progress === 100) return 'Completed';
    return 'In Progress';
  }

  getTimeRemaining(course: Course): string {
    const enrollment = this.getEnrollmentByCourseId(course.id);
    if (!enrollment || enrollment.progress === 100) return 'Completed';
    
    // Since backend doesn't have duration field, return estimated time
    const estimatedTotalMinutes = 600; // 10 hours default
    const completedMinutes = (estimatedTotalMinutes * enrollment.progress) / 100;
    const remainingMinutes = estimatedTotalMinutes - completedMinutes;
    
    if (remainingMinutes < 60) {
      return `${Math.ceil(remainingMinutes)} minutes left`;
    } else if (remainingMinutes < 1440) {
      return `${Math.ceil(remainingMinutes / 60)} hours left`;
    } else {
      return `${Math.ceil(remainingMinutes / 1440)} days left`;
    }
  }

  getNextClass(course: Course): string {
    // Mock data - in real app, this would come from the backend
    const nextClasses = [
      'Introduction to Variables',
      'Control Structures',
      'Functions and Methods',
      'Object-Oriented Programming',
      'Data Structures',
      'Final Project'
    ];
    
    const enrollment = this.getEnrollmentByCourseId(course.id);
    if (!enrollment) return 'No upcoming classes';
    
    const progressIndex = Math.floor((enrollment.progress / 100) * nextClasses.length);
    return nextClasses[progressIndex] || 'Course completed';
  }

  getDaysSinceEnrollment(course: Course): number {
    const enrollment = this.getEnrollmentByCourseId(course.id);
    if (!enrollment) return 0;
    
    const now = new Date();
    const enrollmentDate = new Date(enrollment.enrollmentDate);
    const diffTime = now.getTime() - enrollmentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStudyStreak(course: Course): number {
    // Mock data - in real app, this would be calculated from actual study sessions
    const enrollment = this.getEnrollmentByCourseId(course.id);
    if (!enrollment) return 0;
    
    // Random streak between 1-7 days for demo
    return Math.floor(Math.random() * 7) + 1;
  }

  continueCourse(course: Course): void {
    const enrollment = this.getEnrollmentByCourseId(course.id);
    if (enrollment) {
      // Navigate to course content with enrollment ID
      window.location.href = `/content/${course.id}/${enrollment.id}`;
    }
  }

  viewCourse(course: Course): void {
    // Navigate to course details
    window.location.href = `/courses/${course.id}`;
  }

  markAsFavorite(course: Course): void {
    const enrollment = this.getEnrollmentByCourseId(course.id);
    if (enrollment) {
      enrollment.isFavorite = !enrollment.isFavorite;
      // TODO: Update in backend
      console.log('Toggling favorite for course:', course.id);
    }
  }

  downloadCertificate(course: Course): void {
    const enrollment = this.getEnrollmentByCourseId(course.id);
    if (enrollment && enrollment.certificateEarned) {
      // First, get the certificate for this course
      this.certificateService.getMyCertificates().subscribe({
        next: (certificates) => {
          const certificate = certificates.find(cert => cert.courseId === course.id);
          if (certificate && certificate.url) {
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
                this.notificationService.showError('Download Failed', 'Failed to download certificate. Please try again.');
              }
            });
          } else {
            this.notificationService.showError('Certificate Not Found', 'Certificate not found for this course.');
          }
        },
        error: (error) => {
          console.error('Error fetching certificates:', error);
          this.notificationService.showError('Error', 'Failed to fetch certificate information.');
        }
      });
    } else {
      this.notificationService.showError('No Certificate', 'No certificate available for this course yet.');
    }
  }

  getTotalProgress(): number {
    if (this.enrolledCourses.length === 0) return 0;
    const totalProgress = this.enrolledCourses.reduce((sum, course) => {
      const enrollment = this.getEnrollmentByCourseId(course.id);
      return sum + (enrollment?.progress || 0);
    }, 0);
    return Math.round(totalProgress / this.enrolledCourses.length);
  }

  getTotalCourses(): number {
    return this.enrolledCourses.length;
  }

  getCompletedCoursesCount(): number {
    return this.getCompletedCourses().length;
  }

  getInProgressCoursesCount(): number {
    return this.getInProgressCourses().length;
  }

  getTotalStudyTime(): number {
    return this.enrolledCourses.reduce((total, course) => {
      const enrollment = this.getEnrollmentByCourseId(course.id);
      return total + (enrollment?.totalStudyTime || 0);
    }, 0);
  }

  formatStudyTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes < 1440) {
      return `${Math.round(minutes / 60)} hours`;
    } else {
      return `${Math.round(minutes / 1440)} days`;
    }
  }
}

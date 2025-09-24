import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesService, Course, Module, Class, CourseEnrollment, CourseReview, CourseStats, CourseCategory, CourseFilter } from '../../services/courses.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CourseDetailModalComponent } from '../course-detail-modal/course-detail-modal.component';
import { EnrollmentService } from '../../services/enrollment.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, CourseDetailModalComponent],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  modules: Module[] = [];
  classes: Class[] = [];
  enrollments: CourseEnrollment[] = [];
  reviews: CourseReview[] = [];
  stats: CourseStats | null = null;
  categories: CourseCategory[] = [];
  loading = true;
  error: string | null = null;
  // Removed selectedTab since we no longer have tab navigation
  selectedCourse: Course | null = null;
  selectedModule: Module | null = null;
  selectedClass: Class | null = null;
  selectedEnrollment: CourseEnrollment | null = null;
  isViewingCourse = false;
  isCreatingCourse = false;
  isEditingCourse = false;
  isViewingEnrollment = false;
  isProcessingEnrollment = false;
  searchTerm = '';
  selectedCategory = 'all';
  selectedLevel = 'all';

  selectedInstructor = 'all';
  selectedStatus = 'all';
  priceRange = { min: 0, max: 1000 };
  selectedRating = 0;
  rejectionReason = '';
  newCourse: Partial<Course> = {};
  newModule: Partial<Module> = {};
  newClass: Partial<Class> = {};
  newReview: Partial<CourseReview> = {};
  
  // Course form properties
  courseForm: any = {
    title: '',
    category: '',
    shortDescription: '',
    description: '',
    level: '',
    duration: 0,
    price: 0,
    thumbnail: ''
  };
  submitting = false;
  enrollingCourseId: string | null = null;

  constructor(
    private coursesService: CoursesService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    this.loadCoursesData();
  }

  loadCoursesData(): void {
    this.loading = true;
    this.error = null;

    // Load courses
    this.coursesService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.error = 'Failed to load courses. Please try again.';
        this.loading = false;
      }
    });

    // Load categories
    this.coursesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Don't show error for categories as it's not critical
      }
    });

    // Load course stats if user is instructor or admin
    if (this.isInstructorOrAdmin()) {
      this.coursesService.getCourseStats().subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading course stats:', error);
          // Don't show error for stats as it's not critical
        }
      });
    }
  }

  loadCourseDetails(courseId: string): void {
    this.coursesService.getCourseDetails(courseId).subscribe({
      next: (course) => {
        this.selectedCourse = course;
        // Load modules for this course
        this.coursesService.getModules(courseId).subscribe({
          next: (modules) => {
            this.modules = modules;
          },
          error: (error) => {
            console.error('Error loading modules:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error loading course details:', error);
        this.error = 'Failed to load course details.';
      }
    });
  }

  loadModuleClasses(moduleId: string): void {
    this.coursesService.getClasses(moduleId).subscribe({
      next: (classes) => {
        this.classes = classes;
      },
      error: (error) => {
        console.error('Error loading classes:', error);
      }
    });
  }

  loadCourseEnrollments(courseId: string): void {
    this.coursesService.getCourseEnrollments(courseId).subscribe({
      next: (enrollments) => {
        this.enrollments = enrollments;
      },
      error: (error) => {
        console.error('Error loading enrollments:', error);
      }
    });
  }

  loadCourseReviews(courseId: string): void {
    this.coursesService.getCourseReviews(courseId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
      }
    });
  }

  // Removed ensureValidTab since we no longer have tab navigation

  // Removed switchTab method since we no longer have tab navigation

  switchTab(tab: string): void {
    // This method is kept for compatibility with templates that still reference it
    console.log('Switching to tab:', tab);
  }

  resetForms(): void {
    this.isViewingCourse = false;
    this.isCreatingCourse = false;
    this.isEditingCourse = false;
    this.isViewingEnrollment = false;
    this.isProcessingEnrollment = false;
    this.selectedCourse = null;
    this.selectedModule = null;
    this.selectedClass = null;
    this.selectedEnrollment = null;
    this.rejectionReason = '';
    this.newCourse = {};
    this.newModule = {};
    this.newClass = {};
    this.newReview = {};
  }

  getCategoryColor(categoryName: string): string {
    switch (categoryName.toLowerCase()) {
      case 'programming':
        return 'text-blue-500 bg-blue-100';
      case 'design':
        return 'text-purple-500 bg-purple-100';
      case 'business':
        return 'text-green-500 bg-green-100';
      case 'marketing':
        return 'text-orange-500 bg-orange-100';
      default:
        return 'text-gray-500 bg-gray-100';
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

  getEnrollmentStatusBadgeColor(status: string): string {
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

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  formatDurationHours(hours: number): string {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${hours}h`;
  }

  viewCourse(course: Course): void {
    console.log('viewCourse called', course); // Debug log
    this.selectedCourse = course;
    this.isViewingCourse = true;
    this.loadCourseDetails(course.id);
  }

  createCourse(): void {
    this.isCreatingCourse = true;
    this.resetForms();
  }

  editCourse(course: Course): void {
    this.selectedCourse = course;
    this.isEditingCourse = true;
    this.newCourse = { ...course };
  }

  saveCourse(): void {
    if (!this.selectedCourse) return;
    
    this.submitting = true;
    const courseData = this.newCourse;
    
    this.coursesService.updateCourse(this.selectedCourse.id, courseData).subscribe({
      next: (updatedCourse) => {
        const index = this.courses.findIndex(c => c.id === updatedCourse.id);
        if (index !== -1) {
          this.courses[index] = updatedCourse;
        }
        this.resetForms();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error updating course:', error);
        this.error = 'Failed to update course. Please try again.';
        this.submitting = false;
      }
    });
  }

  deleteCourse(course: Course): void {
    if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
      this.coursesService.deleteCourse(course.id).subscribe({
        next: () => {
          this.courses = this.courses.filter(c => c.id !== course.id);
          this.resetForms();
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          this.error = 'Failed to delete course. Please try again.';
        }
      });
    }
  }

  publishCourse(course: Course): void {
    this.coursesService.publishCourse(course.id).subscribe({
      next: (updatedCourse) => {
        const index = this.courses.findIndex(c => c.id === updatedCourse.id);
        if (index !== -1) {
          this.courses[index] = updatedCourse;
        }
      },
      error: (error) => {
        console.error('Error publishing course:', error);
        this.error = 'Failed to publish course. Please try again.';
      }
    });
  }

  archiveCourse(course: Course): void {
    this.coursesService.archiveCourse(course.id).subscribe({
      next: (updatedCourse) => {
        const index = this.courses.findIndex(c => c.id === updatedCourse.id);
        if (index !== -1) {
          this.courses[index] = updatedCourse;
        }
      },
      error: (error) => {
        console.error('Error archiving course:', error);
        this.error = 'Failed to archive course. Please try again.';
      }
    });
  }

  submitForApproval(course: Course): void {
    this.coursesService.submitForApproval(course.id).subscribe({
      next: (updatedCourse) => {
        const index = this.courses.findIndex(c => c.id === updatedCourse.id);
        if (index !== -1) {
          this.courses[index] = updatedCourse;
        }
      },
      error: (error) => {
        console.error('Error submitting course for approval:', error);
        this.error = 'Failed to submit course for approval. Please try again.';
      }
    });
  }

  approveCourse(course: Course): void {
    this.coursesService.approveCourse(course.id).subscribe({
      next: (updatedCourse) => {
        const index = this.courses.findIndex(c => c.id === updatedCourse.id);
        if (index !== -1) {
          this.courses[index] = updatedCourse;
        }
      },
      error: (error) => {
        console.error('Error approving course:', error);
        this.error = 'Failed to approve course. Please try again.';
      }
    });
  }

  rejectCourse(course: Course): void {
    if (!this.rejectionReason.trim()) {
      this.error = 'Please provide a rejection reason.';
      return;
    }
    
    this.coursesService.rejectCourse(course.id, this.rejectionReason).subscribe({
      next: (updatedCourse) => {
        const index = this.courses.findIndex(c => c.id === updatedCourse.id);
        if (index !== -1) {
          this.courses[index] = updatedCourse;
        }
        this.rejectionReason = '';
      },
      error: (error) => {
        console.error('Error rejecting course:', error);
        this.error = 'Failed to reject course. Please try again.';
      }
    });
  }

  viewEnrollment(enrollment: CourseEnrollment): void {
    this.selectedEnrollment = enrollment;
    this.isViewingEnrollment = true;
  }

  approveEnrollment(enrollment: CourseEnrollment): void {
    this.isProcessingEnrollment = true;
    this.coursesService.approveEnrollment(enrollment.id).subscribe({
      next: (updatedEnrollment) => {
        const index = this.enrollments.findIndex(e => e.id === updatedEnrollment.id);
        if (index !== -1) {
          this.enrollments[index] = updatedEnrollment;
        }
        this.isProcessingEnrollment = false;
      },
      error: (error) => {
        console.error('Error approving enrollment:', error);
        this.error = 'Failed to approve enrollment. Please try again.';
        this.isProcessingEnrollment = false;
      }
    });
  }

  rejectEnrollment(enrollment: CourseEnrollment): void {
    if (!this.rejectionReason.trim()) {
      this.error = 'Please provide a rejection reason.';
      return;
    }
    
    this.isProcessingEnrollment = true;
    this.coursesService.rejectEnrollment(enrollment.id, this.rejectionReason).subscribe({
      next: (updatedEnrollment) => {
        const index = this.enrollments.findIndex(e => e.id === updatedEnrollment.id);
        if (index !== -1) {
          this.enrollments[index] = updatedEnrollment;
        }
        this.rejectionReason = '';
        this.isProcessingEnrollment = false;
      },
      error: (error) => {
        console.error('Error rejecting enrollment:', error);
        this.error = 'Failed to reject enrollment. Please try again.';
        this.isProcessingEnrollment = false;
      }
    });
  }

  enrollInCourse(course: Course): void {
    this.enrollingCourseId = course.id;
    const enrollmentData = {
      courseId: course.id
    };

    this.coursesService.enrollInCourse(enrollmentData).subscribe({
      next: (enrollment) => {
        // Add to enrollments list if viewing course enrollments
        if (this.selectedCourse?.id === course.id) {
          this.enrollments.push(enrollment);
        }
        // Optionally update local enrolled courses list here
        this.notificationService.showSuccess('Enrollment Successful', 'Enrollment request submitted successfully!');
        // Emit event or update shared state for My Courses component if needed
        this.enrollmentService.emitEnrollmentChanged();
        this.enrollingCourseId = null;
        // Refresh the page and redirect to My Courses
        setTimeout(() => {
          window.location.href = '/mycourses';
        }, 500);
      },
      error: (error) => {
        console.error('Error enrolling in course:', error);
        this.notificationService.showError('Enrollment Failed', 'Failed to enroll in course. Please try again.');
        this.enrollingCourseId = null;
      }
    });
  }

  getFilteredCourses(): Course[] {
    let filtered = this.courses;

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        (course.instructor?.name || '').toLowerCase().includes(term) ||
        (course.category?.name || '').toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category?.id === this.selectedCategory);
    }

    // Filter by level
    if (this.selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.difficulty?.name === this.selectedLevel);
    }

    // Filter by instructor
    if (this.selectedInstructor !== 'all') {
      filtered = filtered.filter(course => course.instructorId === this.selectedInstructor);
    }

    // Note: Backend doesn't have status, rating, price fields yet
    // Filter by status
    // if (this.selectedStatus !== 'all') {
    //   filtered = filtered.filter(course => course.status === this.selectedStatus);
    // }

    // Filter by rating
    // if (this.selectedRating > 0) {
    //   filtered = filtered.filter(course => course.rating >= this.selectedRating);
    // }

    // Filter by price range
    // filtered = filtered.filter(course =>
    //   course.price >= this.priceRange.min && course.price <= this.priceRange.max
    // );

    return filtered;
  }

  getPublishedCourses(): Course[] {
    // Since backend doesn't have status field, return all courses
    return this.courses;
  }

  getDraftCourses(): Course[] {
    // Since backend doesn't have status field, return empty array
    return [];
  }

  getCourseById(courseId: string): Course | undefined {
    return this.courses.find(course => course.id === courseId);
  }

  getPendingApprovalCourses(): Course[] {
    // Backend doesn't have status field yet
    return [];
  }

  getFeaturedCourses(): Course[] {
    // Backend doesn't have isFeatured field yet
    return this.courses.slice(0, 3);
  }

  getPopularCourses(): Course[] {
    // Backend doesn't have isPopular field yet
    return this.courses.slice(0, 3);
  }

  getNewCourses(): Course[] {
    // Backend doesn't have isNew field yet
    return this.courses.slice(0, 3);
  }

  getCourseModules(courseId: string): Module[] {
    return this.modules.filter(module => module.courseId === courseId);
  }

  getModuleClasses(moduleId: string): Class[] {
    return this.classes.filter(cls => cls.moduleId === moduleId);
  }

  getCourseEnrollments(courseId: string): CourseEnrollment[] {
    return this.enrollments.filter(enrollment => enrollment.courseId === courseId);
  }

  getCourseReviews(courseId: string): CourseReview[] {
    return this.reviews.filter(review => review.courseId === courseId);
  }

  getPendingEnrollments(): CourseEnrollment[] {
    return this.enrollments.filter(enrollment => enrollment.status === 'PENDING');
  }

  getApprovedEnrollments(): CourseEnrollment[] {
    return this.enrollments.filter(enrollment => enrollment.status === 'APPROVED');
  }

  getRejectedEnrollments(): CourseEnrollment[] {
    return this.enrollments.filter(enrollment => enrollment.status === 'REJECTED');
  }

  getWaitlistedEnrollments(): CourseEnrollment[] {
    return this.enrollments.filter(enrollment => enrollment.status === 'WAITLISTED');
  }

  getAverageRating(courseId: string): number {
    const courseReviews = this.getCourseReviews(courseId);
    if (courseReviews.length === 0) return 0;
    
    const totalRating = courseReviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / courseReviews.length;
  }

  getTotalRevenue(): number {
    return this.enrollments
      .filter(e => e.paymentStatus === 'PAID')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getTotalEnrollments(): number {
    return this.enrollments.length;
  }

  getCompletionRate(): number {
    const completedEnrollments = this.enrollments.filter(e => e.progress === 100);
    return this.enrollments.length > 0 ? (completedEnrollments.length / this.enrollments.length) * 100 : 0;
  }

  getInstructors(): { id: string; name: string }[] {
    const instructors = new Map<string, string>();
    this.courses.forEach(course => {
      instructors.set(course.instructorId, course.instructor?.name || 'Unknown');
    });
    return Array.from(instructors.entries()).map(([id, name]) => ({ id, name }));
  }

  getCategoryById(categoryId: string): CourseCategory | undefined {
    return this.categories.find(category => category.id === categoryId);
  }

  getCategoryIcon(categoryId: string): string {
    const category = this.getCategoryById(categoryId);
    return category?.icon || 'fas fa-book';
  }

  getDiscountPrice(course: Course): number | null {
    // Backend doesn't have discount/price fields yet
    return null;
  }

  hasDiscount(course: Course): boolean {
    // Backend doesn't have discount field yet
    return false;
  }

  getDaysUntilDeadline(course: Course): number | null {
    // Backend doesn't have enrollment deadline yet
    return null;
  }

  isEnrollmentOpen(course: Course): boolean {
    // Backend doesn't have enrollment deadline yet
    return true;
  }

  getEnrollmentStatus(course: Course): string {
    // Backend doesn't have enrollment deadline or max students fields yet
    return 'Open';
  }

  getEnrollmentStatusColor(course: Course): string {
    const status = this.getEnrollmentStatus(course);
    switch (status) {
      case 'Open':
        return 'text-green-500 bg-green-100';
      case 'Full':
        return 'text-red-500 bg-red-100';
      case 'Enrollment Closed':
        return 'text-gray-500 bg-gray-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  }

  exportCourseData(): void {
    // Implementation for exporting course data
    console.log('Exporting course data...');
  }

  bulkApproveCourses(): void {
    const pendingCourses = this.getPendingApprovalCourses();
    if (pendingCourses.length === 0) {
      this.error = 'No pending courses to approve.';
      return;
    }
    
    // Implementation for bulk approval
    console.log('Bulk approving courses...');
  }

  bulkRejectCourses(): void {
    const pendingCourses = this.getPendingApprovalCourses();
    if (pendingCourses.length === 0) {
      this.error = 'No pending courses to reject.';
      return;
    }
    
    // Implementation for bulk rejection
    console.log('Bulk rejecting courses...');
  }

  bulkApproveEnrollments(): void {
    const pendingEnrollments = this.getPendingEnrollments();
    if (pendingEnrollments.length === 0) {
      this.error = 'No pending enrollments to approve.';
      return;
    }
    
    // Implementation for bulk enrollment approval
    console.log('Bulk approving enrollments...');
  }

  bulkRejectEnrollments(): void {
    const pendingEnrollments = this.getPendingEnrollments();
    if (pendingEnrollments.length === 0) {
      this.error = 'No pending enrollments to reject.';
      return;
    }
    
    // Implementation for bulk enrollment rejection
    console.log('Bulk rejecting enrollments...');
  }

  getStarRating(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('fas fa-star text-yellow-400');
    }
    
    if (hasHalfStar) {
      stars.push('fas fa-star-half-alt text-yellow-400');
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push('far fa-star text-gray-300');
    }
    
    return stars;
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    if (progress >= 40) return 'text-orange-600';
    return 'text-red-600';
  }

  getProgressBarColor(progress: number): string {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }

  onSubmitCourseForm(): void {
    if (!this.courseForm.title || !this.courseForm.description) {
      this.error = 'Please fill in all required fields.';
      return;
    }

    this.submitting = true;
    const courseData = {
      title: this.courseForm.title,
      description: this.courseForm.description
    };

    this.coursesService.createCourse(courseData).subscribe({
      next: (newCourse) => {
        this.courses.unshift(newCourse);
        this.resetForms();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error creating course:', error);
        this.error = 'Failed to create course. Please try again.';
        this.submitting = false;
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated;
  }

  isInstructor(): boolean {
    return this.authService.hasRole('INSTRUCTOR');
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  isInstructorOrAdmin(): boolean {
    return this.isInstructor() || this.isAdmin();
  }
}

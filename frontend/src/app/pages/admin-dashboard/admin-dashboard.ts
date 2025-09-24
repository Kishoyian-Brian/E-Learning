import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDashboardService, AdminStats, CourseManagement, UserManagement, PlatformAnalytics, SystemHealth, ApprovalRequest, AdminNotification } from '../../services/admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  selectedTab = 'overview';
  
  // Data
  stats: AdminStats | null = null;
  courses: CourseManagement[] = [];
  users: UserManagement[] = [];
  analytics: PlatformAnalytics | null = null;
  systemHealth: SystemHealth | null = null;
  approvals: ApprovalRequest[] = [];
  notifications: AdminNotification[] = [];
  
  // Filters
  courseFilters = {
    status: 'all',
    category: 'all',
    search: ''
  };
  
  userFilters = {
    role: 'all',
    search: ''
  };
  
  // Course management
  selectedCourse: CourseManagement | null = null;
  showCourseModal = false;
  courseActionLoading = false;
  
  // User management
  selectedUser: UserManagement | null = null;
  showUserModal = false;
  userActionLoading = false;
  
  // Approvals
  selectedApproval: ApprovalRequest | null = null;
  showApprovalModal = false;
  approvalActionLoading = false;
  approvalNotes = '';

  constructor(private adminService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.adminService.loadDashboardData().subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.courses = data.courses;
        this.users = data.users;
        console.log('Loaded users:', this.users); // Debug log
        this.analytics = data.analytics;
        this.systemHealth = data.systemHealth;
        this.approvals = data.approvals;
        this.notifications = data.notifications;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  // Tab navigation
  switchTab(tab: string): void {
    this.selectedTab = tab;
  }

  // Course Management
  getFilteredCourses(): CourseManagement[] {
    let filtered = this.courses;

    if (this.courseFilters.status !== 'all') {
      filtered = filtered.filter(course => course.status === this.courseFilters.status);
    }

    if (this.courseFilters.category !== 'all') {
      filtered = filtered.filter(course => course.category === this.courseFilters.category);
    }

    if (this.courseFilters.search) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(this.courseFilters.search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(this.courseFilters.search.toLowerCase())
      );
    }

    return filtered;
  }

  openCourseModal(course: CourseManagement): void {
    this.selectedCourse = course;
    this.showCourseModal = true;
  }

  closeCourseModal(): void {
    this.selectedCourse = null;
    this.showCourseModal = false;
  }

  updateCourseStatus(courseId: string, status: CourseManagement['status'], notes?: string): void {
    this.courseActionLoading = true;
    this.adminService.updateCourseStatus(courseId, status, notes).subscribe({
      next: (course) => {
        const index = this.courses.findIndex(c => c.id === courseId);
        if (index !== -1) {
          this.courses[index] = course;
        }
        this.courseActionLoading = false;
        this.closeCourseModal();
      },
      error: (error) => {
        console.error('Error updating course status:', error);
        this.courseActionLoading = false;
      }
    });
  }

  toggleCourseFeatured(courseId: string): void {
    this.adminService.toggleCourseFeatured(courseId).subscribe({
      next: (course) => {
        const index = this.courses.findIndex(c => c.id === courseId);
        if (index !== -1) {
          this.courses[index] = course;
        }
      },
      error: (error) => {
        console.error('Error toggling course featured status:', error);
      }
    });
  }

  deleteCourse(courseId: string): void {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      this.adminService.deleteCourse(courseId).subscribe({
        next: () => {
          this.courses = this.courses.filter(c => c.id !== courseId);
        },
        error: (error) => {
          console.error('Error deleting course:', error);
        }
      });
    }
  }

  // User Management
  getFilteredUsers(): UserManagement[] {
    let filtered = this.users;

    if (this.userFilters.role !== 'all') {
      filtered = filtered.filter(user => user.role === this.userFilters.role);
    }

    if (this.userFilters.search) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(this.userFilters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(this.userFilters.search.toLowerCase())
      );
    }

    return filtered;
  }

  openUserModal(user: UserManagement): void {
    this.selectedUser = user;
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.selectedUser = null;
    this.showUserModal = false;
  }

  editUser(user: UserManagement) {
    // TODO: Implement edit logic or open edit modal
    console.log('Edit user:', user);
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  // Approvals
  openApprovalModal(approval: ApprovalRequest): void {
    this.selectedApproval = approval;
    this.showApprovalModal = true;
  }

  closeApprovalModal(): void {
    this.selectedApproval = null;
    this.showApprovalModal = false;
    this.approvalNotes = '';
  }

  approveRequest(requestId: string): void {
    this.approvalActionLoading = true;
    this.adminService.approveRequest(requestId, this.approvalNotes).subscribe({
      next: (approval) => {
        const index = this.approvals.findIndex(a => a.id === requestId);
        if (index !== -1) {
          this.approvals[index] = approval;
        }
        this.approvalActionLoading = false;
        this.closeApprovalModal();
      },
      error: (error) => {
        console.error('Error approving request:', error);
        this.approvalActionLoading = false;
      }
    });
  }

  rejectRequest(requestId: string): void {
    if (!this.approvalNotes.trim()) {
      alert('Please provide rejection notes');
      return;
    }

    this.approvalActionLoading = true;
    this.adminService.rejectRequest(requestId, this.approvalNotes).subscribe({
      next: (approval) => {
        const index = this.approvals.findIndex(a => a.id === requestId);
        if (index !== -1) {
          this.approvals[index] = approval;
        }
        this.approvalActionLoading = false;
        this.closeApprovalModal();
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
        this.approvalActionLoading = false;
      }
    });
  }

  // Notifications
  markNotificationAsRead(notificationId: string): void {
    this.adminService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
          this.notifications[index].isRead = true;
        }
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  // Utility methods
  getStatusColor(status: string): string {
    switch (status) {
      case 'PUBLISHED':
      case 'ACTIVE':
      case 'APPROVED':
        return 'text-green-500 bg-green-100';
      case 'PENDING_REVIEW':
      case 'PENDING':
      case 'PENDING_VERIFICATION':
        return 'text-yellow-500 bg-yellow-100';
      case 'REJECTED':
      case 'SUSPENDED':
        return 'text-red-500 bg-red-100';
      case 'DRAFT':
      case 'INACTIVE':
        return 'text-gray-500 bg-gray-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PUBLISHED':
      case 'ACTIVE':
      case 'APPROVED':
        return 'fas fa-check-circle';
      case 'PENDING_REVIEW':
      case 'PENDING':
      case 'PENDING_VERIFICATION':
        return 'fas fa-clock';
      case 'REJECTED':
      case 'SUSPENDED':
        return 'fas fa-ban';
      case 'DRAFT':
      case 'INACTIVE':
        return 'fas fa-edit';
      default:
        return 'fas fa-question-circle';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'text-red-500 bg-red-100';
      case 'high':
        return 'text-orange-500 bg-orange-100';
      case 'medium':
        return 'text-yellow-500 bg-yellow-100';
      case 'low':
        return 'text-green-500 bg-green-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  }

  getHealthColor(health: string): string {
    switch (health) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  }

  getUnreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getPendingApprovalsCount(): number {
    return this.approvals.filter(approval => approval.status === 'PENDING').length;
  }

  getPendingApprovals(): ApprovalRequest[] {
    return this.approvals.filter(approval => approval.status === 'PENDING').slice(0, 5);
  }

  getCategories(): string[] {
    return [...new Set(this.courses.map(course => course.category))];
  }

  getLevels(): string[] {
    return ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  }

  getRoles(): string[] {
    return ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
  }

  getStatuses(): string[] {
    return ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'];
  }

  getCourseStatuses(): string[] {
    return ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'PENDING_REVIEW', 'REJECTED'];
  }

  // Helper methods for type conversion
  getCourseStatusType(value: string): 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_REVIEW' | 'REJECTED' {
    return value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_REVIEW' | 'REJECTED';
  }

  getUserStatusType(value: string): 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' {
    return value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  }
}

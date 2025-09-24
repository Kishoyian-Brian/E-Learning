import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'course' | 'assignment' | 'announcement';
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string;
  senderName?: string;
  senderAvatar?: string;
  courseName?: string;
  dueDate?: Date;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  selectedFilter: 'all' | 'unread' | 'important' | 'course' | 'assignment' | 'announcement' = 'all';
  searchTerm = '';
  loading = false;
  showReadNotifications = true;

  constructor() {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    
    // Mock data for development
    setTimeout(() => {
      this.notifications = [
        {
          id: '1',
          title: 'Assignment Due Soon',
          message: 'Your assignment for "Data Structures" is due in 2 hours. Please submit it before the deadline.',
          type: 'assignment',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          isRead: false,
          isImportant: true,
          actionUrl: '/assignments',
          courseName: 'Data Structures',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2) // 2 hours from now
        },
        {
          id: '2',
          title: 'New Course Available',
          message: 'A new course "Advanced JavaScript" has been added to your recommended courses.',
          type: 'course',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          isRead: false,
          isImportant: false,
          actionUrl: '/courses',
          courseName: 'Advanced JavaScript'
        },
        {
          id: '3',
          title: 'Course Completion',
          message: 'Congratulations! You have successfully completed the "Web Development Fundamentals" course.',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          isRead: true,
          isImportant: false,
          actionUrl: '/certificates',
          courseName: 'Web Development Fundamentals'
        },
        {
          id: '4',
          title: 'System Maintenance',
          message: 'The platform will be under maintenance from 2:00 AM to 4:00 AM tomorrow. Some features may be temporarily unavailable.',
          type: 'warning',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          isRead: true,
          isImportant: true
        },
        {
          id: '5',
          title: 'New Announcement',
          message: 'Dr. Sarah Johnson has posted a new announcement in your "Machine Learning" course.',
          type: 'announcement',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          isRead: false,
          isImportant: false,
          actionUrl: '/courses/machine-learning',
          senderName: 'Dr. Sarah Johnson',
          senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
          courseName: 'Machine Learning'
        },
        {
          id: '6',
          title: 'Payment Successful',
          message: 'Your payment of $49.99 for "React Development" course has been processed successfully.',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
          isRead: true,
          isImportant: false,
          courseName: 'React Development'
        },
        {
          id: '7',
          title: 'Course Update',
          message: 'New content has been added to your "Python Programming" course. Check it out!',
          type: 'course',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
          isRead: true,
          isImportant: false,
          actionUrl: '/courses/python-programming',
          courseName: 'Python Programming'
        },
        {
          id: '8',
          title: 'Assignment Graded',
          message: 'Your assignment "Final Project" has been graded. You received 95/100 points.',
          type: 'info',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          isRead: true,
          isImportant: false,
          actionUrl: '/assignments',
          courseName: 'Software Engineering'
        },
        {
          id: '9',
          title: 'Discussion Reply',
          message: 'Prof. Michael Chen has replied to your question in the "Algorithms" course discussion forum.',
          type: 'info',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          isRead: false,
          isImportant: false,
          actionUrl: '/courses/algorithms/discussions',
          senderName: 'Prof. Michael Chen',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          courseName: 'Algorithms'
        },
        {
          id: '10',
          title: 'Certificate Ready',
          message: 'Your certificate for "Database Management" is ready for download.',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          isRead: true,
          isImportant: false,
          actionUrl: '/certificates',
          courseName: 'Database Management'
        }
      ];
      
      this.filterNotifications();
      this.loading = false;
    }, 1000);
  }

  filterNotifications(): void {
    let filtered = this.notifications;

    // Apply type filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(notification => {
        switch (this.selectedFilter) {
          case 'unread':
            return !notification.isRead;
          case 'important':
            return notification.isImportant;
          case 'course':
            return notification.type === 'course';
          case 'assignment':
            return notification.type === 'assignment';
          case 'announcement':
            return notification.type === 'announcement';
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (notification.courseName && notification.courseName.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (notification.senderName && notification.senderName.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }

    // Apply read/unread filter
    if (!this.showReadNotifications) {
      filtered = filtered.filter(notification => !notification.isRead);
    }

    this.filteredNotifications = filtered;
  }

  onFilterChange(): void {
    this.filterNotifications();
  }

  onSearchChange(): void {
    this.filterNotifications();
  }

  toggleReadNotifications(): void {
    this.showReadNotifications = !this.showReadNotifications;
    this.filterNotifications();
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.filterNotifications();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
    this.filterNotifications();
  }

  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.filterNotifications();
  }

  clearAllNotifications(): void {
    this.notifications = [];
    this.filteredNotifications = [];
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'error':
        return 'fas fa-times-circle';
      case 'course':
        return 'fas fa-graduation-cap';
      case 'assignment':
        return 'fas fa-tasks';
      case 'announcement':
        return 'fas fa-bullhorn';
      default:
        return 'fas fa-info-circle';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-500 bg-green-100';
      case 'warning':
        return 'text-yellow-500 bg-yellow-100';
      case 'error':
        return 'text-red-500 bg-red-100';
      case 'course':
        return 'text-blue-500 bg-blue-100';
      case 'assignment':
        return 'text-purple-500 bg-purple-100';
      case 'announcement':
        return 'text-orange-500 bg-orange-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getImportantCount(): number {
    return this.notifications.filter(n => n.isImportant).length;
  }

  navigateToAction(notification: Notification): void {
    if (notification.actionUrl) {
      // In a real app, you would use Router to navigate
      console.log('Navigating to:', notification.actionUrl);
    }
  }
}

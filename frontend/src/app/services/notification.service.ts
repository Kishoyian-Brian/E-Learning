import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);

  constructor() { }

  // Get notifications as observable
  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  // Show success notification
  showSuccess(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration,
      timestamp: new Date()
    });
  }

  // Show error notification
  showError(title: string, message: string, duration: number = 7000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration,
      timestamp: new Date()
    });
  }

  // Show warning notification
  showWarning(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration,
      timestamp: new Date()
    });
  }

  // Show info notification
  showInfo(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration,
      timestamp: new Date()
    });
  }

  // Show certificate earned notification
  showCertificateEarned(courseName: string): void {
    this.showSuccess(
      '🎉 Certificate Earned!',
      `Congratulations! You have completed "${courseName}" and earned your certificate.`,
      8000
    );
  }

  // Show course completion notification
  showCourseCompletion(courseName: string): void {
    this.showSuccess(
      '✅ Course Completed!',
      `You have successfully completed "${courseName}". Your certificate has been generated.`,
      8000
    );
  }

  // Show module completion notification
  showModuleCompletion(moduleName: string): void {
    this.showInfo(
      '📚 Module Completed',
      `Great job! You have completed "${moduleName}".`,
      4000
    );
  }

  // Show quiz completion notification
  showQuizCompletion(quizName: string, passed: boolean, score?: number): void {
    if (passed) {
      this.showSuccess(
        '🎯 Quiz Passed!',
        `Congratulations! You passed "${quizName}"${score ? ` with a score of ${score}%` : ''}.`,
        5000
      );
    } else {
      this.showWarning(
        '📝 Quiz Results',
        `You completed "${quizName}"${score ? ` with a score of ${score}%` : ''}. Keep practicing!`,
        5000
      );
    }
  }

  // Add notification to the list
  private addNotification(notification: Notification): void {
    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, notification]);

    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  // Remove notification by ID
  removeNotification(id: string): void {
    const currentNotifications = this.notifications.value;
    this.notifications.next(currentNotifications.filter(n => n.id !== id));
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications.next([]);
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 
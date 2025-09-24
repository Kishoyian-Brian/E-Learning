import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  isMenuOpen = false;
  isUserMenuOpen = false;
  isSearchOpen = false;
  searchQuery = '';
  currentRoute = '';
  currentUser: any = null;
  isAuthenticated = false;
  private subscriptions = new Subscription();
  notifications: any[] = [];
  unreadCount = 0;
  isNotificationDropdownOpen = false;

  // Navigation items for unauthenticated pages (home, about, contact, login, register)
  unauthenticatedNavigationItems = [
    { name: 'About', path: '/about', icon: 'fas fa-info-circle' },
    { name: 'Contact', path: '/contact', icon: 'fas fa-envelope' },
    { name: 'Courses', path: '/courses', icon: 'fas fa-book' },
    { name: 'Login', path: '/login', icon: 'fas fa-sign-in-alt' },
    { name: 'Register', path: '/register', icon: 'fas fa-user-plus' }
  ];

  // Navigation items for authenticated pages (dashboard, mycourses, etc.)
  authenticatedNavigationItems = [
    { name: 'My Courses', path: '/mycourses', icon: 'fas fa-graduation-cap' },
    { name: 'Courses', path: '/courses', icon: 'fas fa-book' },
    { name: 'Discussions', path: '/discussions', icon: 'fas fa-comments' }
  ];

  // Admin navigation items
  adminNavigationItems = [
    { name: 'Admin Dashboard', path: '/admin-dashboard', icon: 'fas fa-shield-alt' },
    { name: 'Users', path: '/users', icon: 'fas fa-users' },
    { name: 'Courses', path: '/courses', icon: 'fas fa-book' },
    { name: 'Analytics', path: '/analytics', icon: 'fas fa-chart-bar' },
    { name: 'Discussions', path: '/discussions', icon: 'fas fa-comments' }
  ];

  // Instructor navigation items
  instructorNavigationItems = [
    { name: 'Instructor Dashboard', path: '/instructor-dashboard', icon: 'fas fa-chalkboard-teacher' },
    { name: 'Courses', path: '/courses', icon: 'fas fa-book' },
    { name: 'Analytics', path: '/analytics', icon: 'fas fa-chart-bar' },
    { name: 'Discussions', path: '/discussions', icon: 'fas fa-comments' }
  ];

  userMenuItems = [
    { name: 'Profile', path: '/profile', icon: 'fas fa-user' },
    { name: 'Settings', path: '/settings', icon: 'fas fa-cog' },
    { name: 'Help', path: '/help', icon: 'fas fa-question-circle' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Listen to route changes
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        this.closeMenus();
        this.updateAuthenticationStatus();
      })
    );

    // Set initial route
    this.currentRoute = this.router.url;
    this.updateAuthenticationStatus();

    // Listen to authentication changes
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isAuthenticated = !!user;
        this.updateAuthenticationStatus();
      })
    );

    this.subscriptions.add(
      this.notificationService.getNotifications().subscribe(notifs => {
        this.notifications = notifs;
        // Fix: If 'isRead' property does not exist, count all as unread
        this.unreadCount = notifs.length;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateAuthenticationStatus(): void {
    // Update authentication status based on current user
    this.isAuthenticated = !!this.currentUser;
  }

  get navigationItems() {
    if (!this.isAuthenticated) {
      return this.unauthenticatedNavigationItems;
    }
    
    // Return role-based navigation
    switch (this.currentUser?.role?.toLowerCase()) {
      case 'admin':
        return this.adminNavigationItems;
      case 'instructor':
        return this.instructorNavigationItems;
      default:
        return this.authenticatedNavigationItems;
    }
  }

  isAuthenticatedPage(): boolean {
    return this.isAuthenticated;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (!this.isSearchOpen) {
      this.searchQuery = '';
    }
  }

  toggleNotificationDropdown(): void {
    this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;
  }

  closeMenus(): void {
    this.isMenuOpen = false;
    this.isUserMenuOpen = false;
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', this.searchQuery);
      this.searchQuery = '';
      this.isSearchOpen = false;
    }
  }

  logout(): void {
    // Close any open menus first
    this.closeMenus();
    
    // Call the auth service logout method
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        // Navigate to home page after successful logout
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails on server, clear local state and navigate
        this.router.navigate(['/']);
      }
    });
  }

  getNotificationCount(): number {
    return this.unreadCount;
  }

  getCartItemCount(): number {
    // TODO: Implement real cart item count
    return 2;
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return '';
    return this.currentUser.name || 'User';
  }

  getUserAvatar(): string {
    if (!this.currentUser || !this.currentUser.avatar) {
      // Return default avatar based on user's name
      const name = this.currentUser?.name || 'U';
      return `https://ui-avatars.com/api/?name=${name}&background=2563eb&color=fff&size=40`;
    }
    return this.currentUser.avatar;
  }

  getUserRole(): string {
    if (!this.currentUser) return '';
    return this.currentUser.role?.toLowerCase() || 'student';
  }
}

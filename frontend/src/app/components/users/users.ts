import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UsersService, User, UserFilters } from '../../services/users.service';

// Simple toast service for demonstration
class ToastService {
  show(message: string, type: 'success' | 'error' = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}
const toast = new ToastService();

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  selectedRole = 'all';
  selectedStatus = 'all';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  Math = Math; // Make Math available in template
  pendingDeleteUser: User | null = null;

  constructor(private usersService: UsersService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    const filters: UserFilters = {
      search: this.searchTerm || undefined,
      role: this.selectedRole !== 'all' ? this.selectedRole : undefined,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    this.usersService.getUsers(filters).subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...this.users];
        this.calculateTotalPages();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.users = [];
        this.filteredUsers = [];
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    let filtered = [...this.users];

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(user => 
        (user.name && user.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    this.filteredUsers = filtered;
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  getPaginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.filterUsers();
  }

  onRoleChange(): void {
    this.filterUsers();
  }

  onStatusChange(): void {
    this.filterUsers();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return 'text-red-500 bg-red-100';
      case 'INSTRUCTOR': return 'text-blue-500 bg-blue-100';
      case 'STUDENT': return 'text-green-500 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'text-green-500 bg-green-100';
      case 'INACTIVE': return 'text-yellow-500 bg-yellow-100';
      case 'SUSPENDED': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'fas fa-check-circle';
      case 'INACTIVE': return 'fas fa-clock';
      case 'SUSPENDED': return 'fas fa-ban';
      default: return 'fas fa-question-circle';
    }
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
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  viewUser(user: User): void {
    this.router.navigate(['/users', user.id]);
  }

  editUser(user: User): void {
    this.router.navigate(['/users', user.id, 'edit']);
  }

  deleteUser(user: User): void {
    this.pendingDeleteUser = user;
  }

  confirmDeleteUser(): void {
    if (!this.pendingDeleteUser) return;
    const user = this.pendingDeleteUser;
    this.usersService.deleteUser(user.id).subscribe({
      next: () => {
        toast.show('User deleted successfully!', 'success');
        this.pendingDeleteUser = null;
        this.loadUsers();
      },
      error: (err) => {
        toast.show('Failed to delete user.', 'error');
        this.pendingDeleteUser = null;
      }
    });
  }

  cancelDeleteUser(): void {
    this.pendingDeleteUser = null;
  }

  toggleUserStatus(user: User): void {
    console.log('Toggling status for user:', user.id);
    // TODO: Toggle user status
  }

  getTotalUsers(): number {
    return this.users.length;
  }

  getStudents(): number {
    return this.users.filter(user => user.role === 'STUDENT').length;
  }

  getInstructors(): number {
    return this.users.filter(user => user.role === 'INSTRUCTOR').length;
  }

  getAdmins(): number {
    return this.users.filter(user => user.role === 'ADMIN').length;
  }
}

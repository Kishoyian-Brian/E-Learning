import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService, User } from '../../services/users.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-primary text-white flex flex-col items-center justify-center">
      <div *ngIf="loading" class="text-xl">Loading user...</div>
      <form *ngIf="!loading && user" (ngSubmit)="onSubmit()" class="bg-blue-900 rounded-lg border border-blue-800 p-8 w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-4">Edit User</h2>
        <div class="mb-4">
          <label class="block mb-1 font-semibold">Name</label>
          <input [(ngModel)]="user.name" name="name" class="w-full px-3 py-2 rounded bg-blue-800 text-white border border-blue-700" required />
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-semibold">Email</label>
          <input [(ngModel)]="user.email" name="email" class="w-full px-3 py-2 rounded bg-blue-800 text-white border border-blue-700" required />
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-semibold">Role</label>
          <select [(ngModel)]="user.role" name="role" class="w-full px-3 py-2 rounded bg-blue-800 text-white border border-blue-700">
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div class="flex space-x-2">
          <button type="submit" [disabled]="saving" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Save</button>
          <button type="button" (click)="goBack()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Cancel</button>
        </div>
        <div *ngIf="error" class="text-red-400 mt-2">{{ error }}</div>
        <div *ngIf="success" class="text-green-400 mt-2">User updated successfully!</div>
      </form>
      <div *ngIf="!loading && !user" class="text-red-400 text-xl">User not found.</div>
    </div>
  `,
  styleUrl: './users.css'
})
export class UserEdit implements OnInit {
  user: User | null = null;
  loading = true;
  saving = false;
  error = '';
  success = false;

  constructor(private route: ActivatedRoute, private usersService: UsersService, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.usersService.getUserById(id).subscribe({
        next: (user) => {
          this.user = user;
          this.loading = false;
        },
        error: () => {
          this.user = null;
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  onSubmit() {
    if (!this.user) return;
    this.saving = true;
    this.error = '';
    this.success = false;
    // Only send updatable fields
    const { name, email, role } = this.user;
    this.usersService.updateUser(this.user.id, { name, email, role }).subscribe({
      next: (updated) => {
        this.saving = false;
        this.success = true;
        setTimeout(() => this.goBack(), 1000);
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Failed to update user.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/users']);
  }
} 
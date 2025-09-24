import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService, User } from '../../services/users.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-primary text-white flex flex-col items-center justify-center">
      <div *ngIf="loading" class="text-xl">Loading user...</div>
      <div *ngIf="!loading && user" class="bg-blue-900 rounded-lg border border-blue-800 p-8 w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-4">User Details</h2>
        <div class="mb-2"><span class="font-semibold">Name:</span> {{ user.name }}</div>
        <div class="mb-2"><span class="font-semibold">Email:</span> {{ user.email }}</div>
        <div class="mb-2"><span class="font-semibold">Role:</span> {{ user.role }}</div>
        <div class="mb-2"><span class="font-semibold">Verified:</span> {{ user.isVerified ? 'Yes' : 'No' }}</div>
        <div class="mb-2"><span class="font-semibold">Created:</span> {{ user.createdAt | date:'medium' }}</div>
        <div class="mb-2"><span class="font-semibold">Updated:</span> {{ user.updatedAt | date:'medium' }}</div>
        <button (click)="goBack()" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Back to Users</button>
      </div>
      <div *ngIf="!loading && !user" class="text-red-400 text-xl">User not found.</div>
    </div>
  `,
  styleUrl: './users.css'
})
export class UserDetail implements OnInit {
  user: User | null = null;
  loading = true;

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

  goBack() {
    this.router.navigate(['/users']);
  }
} 
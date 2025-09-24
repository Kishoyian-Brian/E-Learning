import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-primary text-white flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">
          <i class="fas fa-shield-alt text-red-500"></i>
        </div>
        <h1 class="text-4xl font-bold mb-4">Access Denied</h1>
        <p class="text-xl text-blue-300 mb-8">
          You don't have permission to access this page.
        </p>
        <div class="space-x-4">
          <button 
            routerLink="/home"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <i class="fas fa-home mr-2"></i>Go Home
          </button>
          <button 
            routerLink="/login"
            class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <i class="fas fa-sign-in-alt mr-2"></i>Login
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class Unauthorized {
  constructor() {}
} 
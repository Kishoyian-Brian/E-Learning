import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, Footer],
  templateUrl: './verification.html',
  styleUrl: './verification.css'
})
export class VerificationComponent implements OnInit {
  email = '';
  verificationCode = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  isResendLoading = false;
  countdown = 0;
  countdownInterval: any;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get email from query parameters or localStorage
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || localStorage.getItem('pendingVerificationEmail') || '';
    });

    // Start countdown for resend button
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  onVerifySubmit(): void {
    if (!this.email || !this.verificationCode) {
      this.errorMessage = 'Please enter both email and verification code.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.verifyEmail(this.email, this.verificationCode).subscribe({
      next: (response) => {
        this.successMessage = 'Email verified successfully! You can now log in.';
        this.loading = false;
        
        // Clear pending verification email
        localStorage.removeItem('pendingVerificationEmail');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login'], { 
            queryParams: { 
              email: this.email,
              message: 'Email verified successfully! Please log in.' 
            } 
          });
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Verification failed. Please check your code and try again.';
        this.loading = false;
      }
    });
  }

  resendVerificationEmail(): void {
    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    this.isResendLoading = true;
    this.errorMessage = '';

    this.authService.resendVerificationEmail(this.email).subscribe({
      next: (response) => {
        this.successMessage = 'Verification email sent successfully! Please check your inbox.';
        this.isResendLoading = false;
        this.startCountdown();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to resend verification email. Please try again.';
        this.isResendLoading = false;
      }
    });
  }

  private startCountdown(): void {
    this.countdown = 60; // 60 seconds
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  goToLogin(): void {
    this.router.navigate(['/login'], { 
      queryParams: { email: this.email } 
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register'], { 
      queryParams: { email: this.email } 
    });
  }

  get canResend(): boolean {
    return this.countdown <= 0 && !this.isResendLoading;
  }

  get countdownText(): string {
    if (this.countdown <= 0) {
      return 'Resend Code';
    }
    return `Resend Code (${this.countdown}s)`;
  }
} 
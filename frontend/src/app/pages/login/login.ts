import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Footer } from '../footer/footer';
import { AuthService, LoginCredentials } from '../../services/auth.service';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Footer],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: LoginForm = {
    email: '',
    password: '',
    rememberMe: false
  };

  isSubmitting = false;
  showPassword = false;
  loginError = '';
  loginSuccess = false;

  // Form validation
  emailError = '';
  passwordError = '';

  returnUrl: string = '/student-dashboard';
  courseId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/student-dashboard';
      this.courseId = params['courseId'] || null;
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    // Reset errors
    this.loginError = '';
    this.emailError = '';
    this.passwordError = '';

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    const credentials: LoginCredentials = {
      email: this.loginForm.email,
      password: this.loginForm.password,
      rememberMe: this.loginForm.rememberMe
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.loginSuccess = true;
        this.loginError = '';
        
        console.log('Login successful:', response);
        
        // Redirect to return URL or appropriate dashboard based on user role
          const user = this.authService.currentUser;
        if (user && user.role) {
          const role = user.role.toLowerCase();
          let redirectPath = '/home';
          switch (role) {
            case 'admin':
              redirectPath = '/users';
                break;
            case 'instructor':
              redirectPath = '/instructor-dashboard';
                break;
            case 'student':
              default:
              redirectPath = '/home';
                break;
            }
          console.log('[Login] Redirecting to:', redirectPath);
          this.router.navigate([redirectPath]);
          } else {
          this.router.navigate(['/home']);
          }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.loginError = error.message || 'Login failed. Please try again.';
        this.loginSuccess = false;
        console.error('Login error:', error);
        
        // Check if error is related to unverified email
        if (error.message && (error.message.includes('verify') || error.message.includes('unverified'))) {
          // Store email for verification page
          localStorage.setItem('pendingVerificationEmail', this.loginForm.email);
          
          // Show message and offer to go to verification page
          setTimeout(() => {
            if (confirm('Your email needs to be verified. Would you like to go to the verification page?')) {
              this.router.navigate(['/verification'], { 
                queryParams: { 
                  email: this.loginForm.email,
                  message: 'Please verify your email to continue.' 
                } 
              });
            }
          }, 1000);
        }
      }
    });
  }

  validateForm(): boolean {
    let isValid = true;

    // Email validation
    if (!this.loginForm.email) {
      this.emailError = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.loginForm.email)) {
      this.emailError = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!this.loginForm.password) {
      this.passwordError = 'Password is required';
      isValid = false;
    } else if (this.loginForm.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      isValid = false;
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onEmailChange(): void {
    if (this.emailError) {
      this.emailError = '';
    }
  }

  onPasswordChange(): void {
    if (this.passwordError) {
      this.passwordError = '';
    }
  }

  loginWithGoogle(): void {
    console.log('Logging in with Google...');
    // Implement Google OAuth
  }

  loginWithFacebook(): void {
    console.log('Logging in with Facebook...');
    // Implement Facebook OAuth
  }

  loginWithGithub(): void {
    console.log('Logging in with GitHub...');
    // Implement GitHub OAuth
  }

  forgotPassword(): void {
    console.log('Forgot password clicked...');
    // Navigate to forgot password page
  }

  getPasswordInputType(): string {
    return this.showPassword ? 'text' : 'password';
  }

  getPasswordIcon(): string {
    return this.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
  }

  getFormStatus(): string {
    if (this.loginSuccess) return 'success';
    if (this.loginError) return 'error';
    return 'default';
  }

  getStatusIcon(): string {
    switch (this.getFormStatus()) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      default:
        return '';
    }
  }

  getStatusColor(): string {
    switch (this.getFormStatus()) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return '';
    }
  }

  getStatusBgColor(): string {
    switch (this.getFormStatus()) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return '';
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginCredentials, RegisterData, User } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  // Login form
  loginForm: LoginCredentials = {
    email: '',
    password: '',
    rememberMe: false
  };
  
  // Register form
  registerForm: RegisterData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    agreeToTerms: false,
    agreeToMarketing: false
  };
  
  // Form validation
  loginErrors: { [key: string]: string } = {};
  registerErrors: { [key: string]: string } = {};
  
  // Password visibility
  showLoginPassword = false;
  showRegisterPassword = false;
  showConfirmPassword = false;
  
  // Social login loading states
  socialLoginLoading: { [key: string]: boolean } = {
    google: false,
    facebook: false,
    github: false
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated) {
      this.redirectBasedOnRole();
    }
  }

  // Toggle between login and register modes
  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.clearMessages();
    this.clearFormErrors();
  }

  // Login form methods
  onLoginSubmit(): void {
    this.clearMessages();
    this.clearLoginErrors();
    
    if (!this.validateLoginForm()) {
      return;
    }

    this.loading = true;
    
    this.authService.login(this.loginForm).subscribe({
      next: (response) => {
        this.successMessage = 'Login successful! Redirecting...';
        this.loading = false;
        
        // Redirect based on user role
        setTimeout(() => {
          this.redirectBasedOnRole();
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }

  // Register form methods
  onRegisterSubmit(): void {
    this.clearMessages();
    this.clearRegisterErrors();
    
    if (!this.validateRegisterForm()) {
      return;
    }

    this.loading = true;
    
    this.authService.register(this.registerForm).subscribe({
      next: (response) => {
        this.successMessage = 'Registration successful! Welcome to EduSoma.';
        this.loading = false;
        
        // Redirect based on user role
        setTimeout(() => {
          this.redirectBasedOnRole();
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  // Social login methods
  loginWithGoogle(): void {
    this.socialLoginLoading['google'] = true;
    this.clearMessages();
    
    // Simulate Google OAuth
    setTimeout(() => {
      this.authService.socialLogin({
        provider: 'google',
        token: 'mock-google-token'
      }).subscribe({
        next: (response) => {
          this.successMessage = 'Google login successful!';
          this.socialLoginLoading['google'] = false;
          setTimeout(() => {
            this.redirectBasedOnRole();
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Google login failed. Please try again.';
          this.socialLoginLoading['google'] = false;
        }
      });
    }, 1000);
  }

  loginWithFacebook(): void {
    this.socialLoginLoading['facebook'] = true;
    this.clearMessages();
    
    // Simulate Facebook OAuth
    setTimeout(() => {
      this.authService.socialLogin({
        provider: 'facebook',
        token: 'mock-facebook-token'
      }).subscribe({
        next: (response) => {
          this.successMessage = 'Facebook login successful!';
          this.socialLoginLoading['facebook'] = false;
          setTimeout(() => {
            this.redirectBasedOnRole();
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Facebook login failed. Please try again.';
          this.socialLoginLoading['facebook'] = false;
        }
      });
    }, 1000);
  }

  loginWithGithub(): void {
    this.socialLoginLoading['github'] = true;
    this.clearMessages();
    
    // Simulate GitHub OAuth
    setTimeout(() => {
      this.authService.socialLogin({
        provider: 'github',
        token: 'mock-github-token'
      }).subscribe({
        next: (response) => {
          this.successMessage = 'GitHub login successful!';
          this.socialLoginLoading['github'] = false;
          setTimeout(() => {
            this.redirectBasedOnRole();
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'GitHub login failed. Please try again.';
          this.socialLoginLoading['github'] = false;
        }
      });
    }, 1000);
  }

  // Password visibility toggles
  toggleLoginPasswordVisibility(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPasswordVisibility(): void {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Form validation methods
  private validateLoginForm(): boolean {
    let isValid = true;
    
    if (!this.loginForm.email) {
      this.loginErrors['email'] = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.loginForm.email)) {
      this.loginErrors['email'] = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!this.loginForm.password) {
      this.loginErrors['password'] = 'Password is required';
      isValid = false;
    } else if (this.loginForm.password.length < 6) {
      this.loginErrors['password'] = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    return isValid;
  }

  private validateRegisterForm(): boolean {
    let isValid = true;
    
    if (!this.registerForm.name) {
      this.registerErrors['name'] = 'Name is required';
      isValid = false;
    }
    
    if (!this.registerForm.email) {
      this.registerErrors['email'] = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.registerForm.email)) {
      this.registerErrors['email'] = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!this.registerForm.password) {
      this.registerErrors['password'] = 'Password is required';
      isValid = false;
    } else if (this.registerForm.password.length < 8) {
      this.registerErrors['password'] = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!this.isStrongPassword(this.registerForm.password)) {
      this.registerErrors['password'] = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
      isValid = false;
    }
    
    if (!this.registerForm.confirmPassword) {
      this.registerErrors['confirmPassword'] = 'Please confirm your password';
      isValid = false;
    } else if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.registerErrors['confirmPassword'] = 'Passwords do not match';
      isValid = false;
    }
    
    if (!this.registerForm.agreeToTerms) {
      this.registerErrors['agreeToTerms'] = 'You must agree to the terms and conditions';
      isValid = false;
    }
    
    return isValid;
  }

  // Utility methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isStrongPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return passwordRegex.test(password);
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private clearLoginErrors(): void {
    this.loginErrors = {};
  }

  private clearRegisterErrors(): void {
    this.registerErrors = {};
  }

  private clearFormErrors(): void {
    this.loginErrors = {};
    this.registerErrors = {};
  }

  private redirectBasedOnRole(): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    switch (user.role) {
      case 'STUDENT':
        this.router.navigate(['/student-dashboard']);
        break;
      case 'INSTRUCTOR':
        this.router.navigate(['/instructor-dashboard']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin-dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  // Demo credentials
  useDemoCredentials(): void {
    this.loginForm.email = 'demo@example.com';
    this.loginForm.password = 'password';
  }

  // Get password input type
  getLoginPasswordType(): string {
    return this.showLoginPassword ? 'text' : 'password';
  }

  getRegisterPasswordType(): string {
    return this.showRegisterPassword ? 'text' : 'password';
  }

  getConfirmPasswordType(): string {
    return this.showConfirmPassword ? 'text' : 'password';
  }

  // Get password icon
  getLoginPasswordIcon(): string {
    return this.showLoginPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
  }

  getRegisterPasswordIcon(): string {
    return this.showRegisterPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
  }

  getConfirmPasswordIcon(): string {
    return this.showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
  }

  // Check if any social login is loading
  get isAnySocialLoginLoading(): boolean {
    return Object.values(this.socialLoginLoading).some(loading => loading);
  }

  // Get current form errors
  get hasLoginErrors(): boolean {
    return Object.keys(this.loginErrors).length > 0;
  }

  get hasRegisterErrors(): boolean {
    return Object.keys(this.registerErrors).length > 0;
  }
}

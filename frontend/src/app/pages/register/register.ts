import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Footer } from '../footer/footer';
import { AuthService, RegisterData } from '../../services/auth.service';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Footer],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm: RegisterForm = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT', // Always student
    agreeToTerms: false,
    agreeToMarketing: false
  };

  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  registerError = '';
  registerSuccess = false;
  verificationMessage = '';

  // Form validation
  nameError = '';
  emailError = '';
  passwordError = '';
  confirmPasswordError = '';
  termsError = '';

  // Password strength
  passwordStrength: PasswordStrength = {
    score: 0,
    label: '',
    color: '',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false
    }
  };

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
    this.resetErrors();

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    const registerData: RegisterData = {
      name: this.registerForm.name,
      email: this.registerForm.email,
      password: this.registerForm.password,
      confirmPassword: this.registerForm.confirmPassword,
      role: this.registerForm.role,
      agreeToTerms: this.registerForm.agreeToTerms,
      agreeToMarketing: this.registerForm.agreeToMarketing
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.registerSuccess = true;
        this.registerError = '';
        this.verificationMessage = response.message || 'Registration successful! Please check your email for verification.';
        
        console.log('Registration successful:', response);
        
        // Store email for verification page
        localStorage.setItem('pendingVerificationEmail', this.registerForm.email);
        
        // Redirect to verification page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/verification'], { 
            queryParams: { 
              email: this.registerForm.email,
              message: 'Registration successful! Please verify your email.' 
            } 
          });
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.registerError = error.message || 'Registration failed. Please try again.';
        this.registerSuccess = false;
        console.error('Registration error:', error);
      }
    });
  }

  validateForm(): boolean {
    let isValid = true;

    // Name validation
    if (!this.registerForm.name.trim()) {
      this.nameError = 'Name is required';
      isValid = false;
    } else if (this.registerForm.name.trim().length < 2) {
      this.nameError = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Email validation
    if (!this.registerForm.email) {
      this.emailError = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.registerForm.email)) {
      this.emailError = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!this.registerForm.password) {
      this.passwordError = 'Password is required';
      isValid = false;
    } else if (this.passwordStrength.score < 3) {
      this.passwordError = 'Password is too weak';
      isValid = false;
    }

    // Confirm password validation
    if (!this.registerForm.confirmPassword) {
      this.confirmPasswordError = 'Please confirm your password';
      isValid = false;
    } else if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      isValid = false;
    }

    // Terms validation
    if (!this.registerForm.agreeToTerms) {
      this.termsError = 'You must agree to the terms and conditions';
      isValid = false;
    }

    return isValid;
  }

  resetErrors(): void {
    this.registerError = '';
    this.nameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.termsError = '';
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onPasswordChange(): void {
    this.checkPasswordStrength();
    if (this.passwordError) {
      this.passwordError = '';
    }
  }

  onConfirmPasswordChange(): void {
    if (this.confirmPasswordError) {
      this.confirmPasswordError = '';
    }
  }

  onFieldChange(field: string): void {
    switch (field) {
      case 'name':
        if (this.nameError) this.nameError = '';
        break;
      case 'email':
        if (this.emailError) this.emailError = '';
        break;
      case 'terms':
        if (this.termsError) this.termsError = '';
        break;
    }
  }

  checkPasswordStrength(): void {
    const password = this.registerForm.password;
    let score = 0;
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Calculate score
    if (requirements.length) score++;
    if (requirements.uppercase) score++;
    if (requirements.lowercase) score++;
    if (requirements.numbers) score++;
    if (requirements.symbols) score++;

    // Determine label and color
    let label = '';
    let color = '';

    switch (score) {
      case 0:
      case 1:
        label = 'Very Weak';
        color = 'red';
        break;
      case 2:
        label = 'Weak';
        color = 'orange';
        break;
      case 3:
        label = 'Fair';
        color = 'yellow';
        break;
      case 4:
        label = 'Good';
        color = 'lightgreen';
        break;
      case 5:
        label = 'Strong';
        color = 'green';
        break;
    }

    this.passwordStrength = {
      score,
      label,
      color,
      requirements
    };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getPasswordInputType(): string {
    return this.showPassword ? 'text' : 'password';
  }

  getConfirmPasswordInputType(): string {
    return this.showConfirmPassword ? 'text' : 'password';
  }

  getPasswordIcon(): string {
    return this.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
  }

  getConfirmPasswordIcon(): string {
    return this.showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
  }

  getPasswordStrengthBarColor(): string {
    switch (this.passwordStrength.color) {
      case 'red': return 'bg-red-500';
      case 'orange': return 'bg-orange-500';
      case 'yellow': return 'bg-yellow-500';
      case 'lightgreen': return 'bg-green-400';
      case 'green': return 'bg-green-600';
      default: return 'bg-gray-300';
    }
  }

  getPasswordStrengthBarWidth(): string {
    return `${(this.passwordStrength.score / 5) * 100}%`;
  }

  registerWithGoogle(): void {
    console.log('Registering with Google...');
    // Implement Google OAuth
  }

  registerWithFacebook(): void {
    console.log('Registering with Facebook...');
    // Implement Facebook OAuth
  }

  registerWithGithub(): void {
    console.log('Registering with GitHub...');
    // Implement GitHub OAuth
  }

  getFormStatus(): string {
    if (this.registerSuccess) return 'success';
    if (this.registerError) return 'error';
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

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}

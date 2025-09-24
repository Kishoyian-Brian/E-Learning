import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursesService, Course, CourseCategory } from '../../services/courses.service';
import { AuthService } from '../../services/auth.service';
import { Footer } from "../footer/footer";
import { CourseDetailModalComponent } from '../../components/course-detail-modal/course-detail-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, Footer, CourseDetailModalComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  courses: Course[] = [];
  categories: CourseCategory[] = [];
  loading = true;
  searchTerm = '';
  selectedCategory = 'all';
  selectedLevel = 'all';
  priceRange = { min: 0, max: 1000 };
  selectedRating = 0;
  selectedCourse: Course | null = null;
  isViewingCourse = false;

  constructor(
    private coursesService: CoursesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCoursesData();
  }

  loadCoursesData(): void {
    // Using mock data for development
    this.coursesService.getPublicCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
      }
    });

    this.coursesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
    this.loading = false;
  }

  getPublishedCourses(): Course[] {
    // Since backend doesn't have status field, return all courses
    return this.courses;
  }

  getFilteredCourses(): Course[] {
    let filtered = this.getPublishedCourses();

    if (this.searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (course.instructor?.name || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (course.category?.name || '').toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category?.id === this.selectedCategory);
    }

    if (this.selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.difficulty?.name === this.selectedLevel);
    }

    // Note: Backend doesn't have price, rating fields yet
    // filtered = filtered.filter(course => 
    //   course.price >= this.priceRange.min && course.price <= this.priceRange.max
    // );

    return filtered;
  }

  getFeaturedCourses(): Course[] {
    // For now, return recent courses as featured
    return this.getPublishedCourses().slice(0, 3);
  }

  getPopularCourses(): Course[] {
    // For now, return courses with most enrollments
    return this.getPublishedCourses()
      .sort((a, b) => (b._count?.enrollments || 0) - (a._count?.enrollments || 0))
      .slice(0, 3);
  }

  getNewCourses(): Course[] {
    // Return most recently created courses
    return this.getPublishedCourses()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }

  getDifficultyColor(difficultyName: string): string {
    switch (difficultyName.toLowerCase()) {
      case 'beginner':
        return 'text-green-500 bg-green-100';
      case 'intermediate':
        return 'text-yellow-500 bg-yellow-100';
      case 'advanced':
        return 'text-red-500 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }



  enrollInCourse(course: Course): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated) {
      // Check if user has any stored data (indicating they might be registered)
      const storedUser = localStorage.getItem('auth_user');
      
      if (storedUser) {
        // User has some data, redirect to login
        this.router.navigate(['/login'], { 
          queryParams: { 
            returnUrl: '/courses',
            courseId: course.id 
          } 
        });
      } else {
        // No user data, redirect to registration
        this.router.navigate(['/register'], { 
          queryParams: { 
            returnUrl: '/courses',
            courseId: course.id 
          } 
        });
      }
    } else {
      // User is authenticated, proceed with enrollment
      console.log('Enrolling in course:', course.id);
      // TODO: Implement actual enrollment logic
      // For now, just navigate to the course details or mycourses
      this.router.navigate(['/mycourses']);
    }
  }

  viewCourse(course: Course): void {
    this.selectedCourse = course;
    this.isViewingCourse = true;
  }

  closeCourseModal(): void {
    this.selectedCourse = null;
    this.isViewingCourse = false;
  }

  goToCourses(): void {
    this.router.navigate(['/courses']);
  }
}

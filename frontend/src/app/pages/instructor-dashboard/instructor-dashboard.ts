import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InstructorService, Course, Analytics } from '../../services/instructor.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './instructor-dashboard.html',
  styleUrl: './instructor-dashboard.css'
})
export class InstructorDashboard implements OnInit {
  courses: Course[] = [];
  analytics: any = null;
  loading = true;
  selectedTab = 'overview';

  // Course creation modal state
  showCreateCourseModal = false;
  creatingCourse = false;
  categories: any[] = [];
  difficulties: any[] = [];

  // Course form data
  newCourse = {
    title: '',
    description: '',
    categoryId: '',
    difficultyId: ''
  };

  constructor(private instructorService: InstructorService, private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadCategoriesAndDifficulties();
  }

  loadDashboardData(): void {
    this.instructorService.getCourses().subscribe({
      next: (courses: any[]) => {
        // Map category and difficulty to strings for display
        this.courses = courses.map(course => ({
          ...course,
          category: course.category?.name || course.category,
          difficulty: course.difficulty?.name || course.difficulty
        }));
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading instructor courses:', error);
        this.loading = false;
      }
    });

    this.instructorService.getAnalytics().subscribe({
      next: (analytics: any) => {
        this.analytics = analytics;
      },
      error: (error: any) => {
        console.error('Error loading instructor analytics:', error);
        // Set default values if analytics fails
        this.analytics = {
          totalCourses: 0,
          totalStudents: 0,
          totalClasses: 0,
          averageRating: 0,
          recentEnrollments: 0
        };
      }
    });
  }

  loadCategoriesAndDifficulties(): void {
    // Load categories
    this.instructorService.getCategories().subscribe({
      next: (categories: any[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
      }
    });

    // Load difficulties
    this.instructorService.getDifficulties().subscribe({
      next: (difficulties: any[]) => {
        this.difficulties = difficulties;
      },
      error: (error: any) => {
        console.error('Error loading difficulties:', error);
      }
    });
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty?.toUpperCase()) {
      case 'BEGINNER':
        return 'bg-green-500';
      case 'INTERMEDIATE':
        return 'bg-yellow-500';
      case 'ADVANCED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  getDifficultyText(difficulty: string): string {
    switch (difficulty?.toUpperCase()) {
      case 'BEGINNER':
        return 'Beginner';
      case 'INTERMEDIATE':
        return 'Intermediate';
      case 'ADVANCED':
        return 'Advanced';
      default:
        return difficulty || 'Unknown';
    }
  }

  createNewCourse(): void {
    this.showCreateCourseModal = true;
    this.resetCourseForm();
  }

  closeCreateCourseModal(): void {
    this.showCreateCourseModal = false;
    this.resetCourseForm();
  }

  resetCourseForm(): void {
    this.newCourse = {
      title: '',
      description: '',
      categoryId: '',
      difficultyId: ''
    };
  }

  submitCreateCourse(): void {
    if (!this.validateCourseForm()) {
      return;
    }

    this.creatingCourse = true;
    this.instructorService.createCourse(this.newCourse).subscribe({
      next: (course: any) => {
        console.log('Course created successfully:', course);
        this.closeCreateCourseModal();
        // Immediately add the new course to the UI
        this.courses = [course, ...this.courses];
        // Navigate to course editor with modules tab open
        setTimeout(() => {
          this.router.navigate([`/course-editor/${course.id}`], { queryParams: { tab: 'modules' } });
        }, 500);
        this.creatingCourse = false;
      },
      error: (error: any) => {
        console.error('Error creating course:', error);
        this.creatingCourse = false;
        // TODO: Show error message to user
      }
    });
  }

  validateCourseForm(): boolean {
    if (!this.newCourse.title.trim()) {
      alert('Please enter a course title');
      return false;
    }
    if (!this.newCourse.description.trim()) {
      alert('Please enter a course description');
      return false;
    }
    if (!this.newCourse.categoryId) {
      alert('Please select a category');
      return false;
    }
    if (!this.newCourse.difficultyId) {
      alert('Please select a difficulty level');
      return false;
    }
    return true;
  }

  editCourse(courseId: string): void {
    // Navigate to course editor page
    window.location.href = `/course-editor/${courseId}`;
  }

  addModules(courseId: string): void {
    // Navigate to course editor with modules tab active
    window.location.href = `/course-editor/${courseId}?tab=modules`;
  }

  addQuizzes(courseId: string): void {
    // Navigate to course editor with quizzes tab active
    window.location.href = `/course-editor/${courseId}?tab=quizzes`;
  }

  quickAddModule(): void {
    if (this.courses.length === 1) {
      this.addModules(this.courses[0].id);
    } else {
      alert('Please click "Add Modules" on the specific course you want to add modules to.');
    }
  }

  quickAddQuiz(): void {
    if (this.courses.length === 1) {
      this.addQuizzes(this.courses[0].id);
    } else {
      alert('Please click "Add Quizzes" on the specific course you want to add quizzes to.');
    }
  }

  manageCourseContent(): void {
    // If there's only one course, go directly to it
    if (this.courses.length === 1) {
      this.editCourse(this.courses[0].id);
    } else {
      // Show a modal or alert to select which course to edit
      alert('Please click "Edit Course" on the specific course you want to manage content for.');
    }
  }

  viewCourse(courseId: string): void {
    // TODO: Navigate to course view page
    console.log('View course:', courseId);
  }

  getRecentEnrollments(): number {
    return this.analytics?.recentEnrollments || 0;
  }

  getTotalStudents(): number {
    return this.analytics?.totalStudents || 0;
  }

  getAverageRating(): number {
    return this.analytics?.averageRating || 0;
  }

  getTotalCourses(): number {
    return this.analytics?.totalCourses || 0;
  }

  getTotalClasses(): number {
    return this.analytics?.totalClasses || 0;
  }
}

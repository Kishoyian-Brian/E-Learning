import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursesService, Course, Module } from '../../services/courses.service';
import { QuizService, Quiz, QuizQuestion } from '../../services/quiz.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-course-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-editor.html',
  styleUrl: './course-editor.css'
})
export class CourseEditor implements OnInit {
  courseId: string = '';
  course: Course | null = null;
  modules: Module[] = [];
  quizzes: Quiz[] = [];
  loading = true;
  error: string | null = null;

  // Module creation
  showModuleModal = false;
  creatingModule = false;
  newModule = {
    title: '',
    description: '',
    order: 1
  };

  // Quiz creation
  showQuizModal = false;
  creatingQuiz = false;
  newQuiz = {
    title: '',
    courseId: '',
    timeLimit: 30,
    questions: [] as any[]
  };

  // Question creation
  showQuestionModal = false;
  addingQuestion = false;
  newQuestion = {
    text: '',
    type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY',
    options: ['', '', '', ''],
    answer: '',
    order: 1
  };

  showMaterialModal = false;
  creatingMaterial = false;
  materialInputType: 'file' | 'link' = 'file';
  selectedFile: File | null = null;
  newMaterial = {
    title: '',
    description: '',
    type: 'VIDEO',
    url: '',
    order: 1,
    visible: true,
    moduleId: ''
  };
  selectedModuleForMaterial: Module | null = null;

  selectedTab = 'modules';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private coursesService: CoursesService,
    private quizService: QuizService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private http: HttpClient // <-- for direct backend call
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.courseId = params['courseId'];
      if (this.courseId) {
        this.loadCourse();
        this.loadModules();
        this.loadQuizzes();
      }
    });

    // Check for tab parameter in URL
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['tab']) {
        this.selectedTab = queryParams['tab'];
      }
    });
  }

  loadCourse(): void {
    this.coursesService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.course = course;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.error = 'Failed to load course';
        this.loading = false;
      }
    });
  }

  loadModules(): void {
    this.coursesService.getModules(this.courseId).subscribe({
      next: (modules) => {
        this.modules = modules.sort((a, b) => a.order - b.order);
      },
      error: (error) => {
        console.error('Error loading modules:', error);
      }
    });
  }

  loadQuizzes(): void {
    this.quizService.getQuizzesByCourse(this.courseId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
      }
    });
  }

  // Module Management
  createModule(): void {
    this.showModuleModal = true;
    this.resetModuleForm();
  }

  closeModuleModal(): void {
    this.showModuleModal = false;
    this.resetModuleForm();
  }

  resetModuleForm(): void {
    this.newModule = {
      title: '',
      description: '',
      order: this.modules.length + 1
    };
  }

  submitCreateModule(): void {
    if (!this.validateModuleForm()) {
      return;
    }

    this.creatingModule = true;
    const moduleData = {
      ...this.newModule,
      courseId: this.courseId
    };

    this.coursesService.createModule(moduleData).subscribe({
      next: (module) => {
        this.notificationService.showSuccess('Module Created', 'Module has been created successfully');
        this.closeModuleModal();
        // Poll the backend every second for up to 5 seconds until the new module appears
        let pollCount = 0;
        const pollModules = () => {
          this.coursesService.getModules(this.courseId).subscribe({
            next: (modules) => {
              this.modules = modules.sort((a, b) => a.order - b.order);
              if (modules.some(m => m.id === module.id) || pollCount >= 5) {
                // Found the new module or max attempts reached
                // Automatically open the quiz creation modal
                setTimeout(() => {
                  this.createQuiz();
                }, 300);
                return;
              } else {
                pollCount++;
                setTimeout(pollModules, 1000);
              }
            },
            error: () => {
              pollCount++;
              if (pollCount < 5) setTimeout(pollModules, 1000);
            }
          });
        };
        pollModules();
        this.creatingModule = false;
      },
      error: (error) => {
        console.error('Error creating module:', error);
        this.notificationService.showError('Error', 'Failed to create module');
        this.creatingModule = false;
      }
    });
  }

  validateModuleForm(): boolean {
    if (!this.newModule.title.trim()) {
      this.notificationService.showError('Error', 'Please enter a module title');
      return false;
    }
    if (!this.newModule.description.trim()) {
      this.notificationService.showError('Error', 'Please enter a module description');
      return false;
    }
    if (this.newModule.order < 1) {
      this.notificationService.showError('Error', 'Order must be at least 1');
      return false;
    }
    return true;
  }

  deleteModule(moduleId: string): void {
    if (confirm('Are you sure you want to delete this module?')) {
      this.coursesService.deleteModule(moduleId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Module Deleted', 'Module has been deleted successfully');
          this.loadModules();
        },
        error: (error) => {
          console.error('Error deleting module:', error);
          this.notificationService.showError('Error', 'Failed to delete module');
        }
      });
    }
  }

  // Quiz Management
  createQuiz(): void {
    this.showQuizModal = true;
    this.resetQuizForm();
  }

  closeQuizModal(): void {
    this.showQuizModal = false;
    this.resetQuizForm();
  }

  resetQuizForm(): void {
    this.newQuiz = {
      title: '',
      courseId: this.courseId,
      timeLimit: 30,
      questions: []
    };
  }

  submitCreateQuiz(): void {
    if (!this.validateQuizForm()) {
      return;
    }

    this.creatingQuiz = true;
    const quizData = {
      ...this.newQuiz,
      courseId: this.courseId
    };

    this.quizService.createQuiz(quizData).subscribe({
      next: (quiz) => {
        this.notificationService.showSuccess('Quiz Created', 'Quiz has been created successfully');
        this.closeQuizModal();
        // Poll the backend every second for up to 5 seconds until the new quiz appears
        let pollCount = 0;
        const pollQuizzes = () => {
          this.quizService.getQuizzesByCourse(this.courseId).subscribe({
            next: (quizzes) => {
              this.quizzes = quizzes;
              if (quizzes.some(q => q.id === quiz.id) || pollCount >= 5) {
                // Found the new quiz or max attempts reached
                // Redirect to dashboard after quiz creation
                setTimeout(() => {
                  this.router.navigate(['/instructor-dashboard']);
                }, 500);
                return;
              } else {
                pollCount++;
                setTimeout(pollQuizzes, 1000);
              }
            },
            error: () => {
              pollCount++;
              if (pollCount < 5) setTimeout(pollQuizzes, 1000);
            }
          });
        };
        pollQuizzes();
        this.creatingQuiz = false;
      },
      error: (error) => {
        console.error('Error creating quiz:', error);
        this.notificationService.showError('Error', 'Failed to create quiz');
        this.creatingQuiz = false;
      }
    });
  }

  validateQuizForm(): boolean {
    if (!this.newQuiz.title.trim()) {
      this.notificationService.showError('Error', 'Please enter a quiz title');
      return false;
    }
    if (this.newQuiz.questions.length === 0) {
      this.notificationService.showError('Error', 'Please add at least one question');
      return false;
    }
    return true;
  }

  deleteQuiz(quizId: string): void {
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.quizService.deleteQuiz(quizId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Quiz Deleted', 'Quiz has been deleted successfully');
          this.loadQuizzes();
        },
        error: (error) => {
          console.error('Error deleting quiz:', error);
          this.notificationService.showError('Error', 'Failed to delete quiz');
        }
      });
    }
  }

  // Question Management
  addQuestion(): void {
    this.showQuestionModal = true;
    this.resetQuestionForm();
  }

  closeQuestionModal(): void {
    this.showQuestionModal = false;
    this.resetQuestionForm();
  }

  resetQuestionForm(): void {
    this.newQuestion = {
      text: '',
      type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      answer: '',
      order: this.newQuiz.questions.length + 1
    };
  }

  submitAddQuestion(): void {
    if (!this.validateQuestionForm()) {
      return;
    }

    this.addingQuestion = true;
    const questionData = {
      text: this.newQuestion.text,
      type: this.newQuestion.type,
      options: this.newQuestion.options,
      answer: this.newQuestion.answer,
      order: this.newQuestion.order
    };

    // Add question to the quiz
    this.newQuiz.questions.push(questionData);
    this.closeQuestionModal();
    this.addingQuestion = false;
  }

  validateQuestionForm(): boolean {
    if (!this.newQuestion.text.trim()) {
      this.notificationService.showError('Error', 'Please enter a question');
      return false;
    }
    if (this.newQuestion.type === 'MULTIPLE_CHOICE') {
      const validOptions = this.newQuestion.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        this.notificationService.showError('Error', 'Please add at least 2 options');
        return false;
      }
      if (!this.newQuestion.answer.trim()) {
        this.notificationService.showError('Error', 'Please select the correct answer');
        return false;
      }
    } else if (!this.newQuestion.answer.trim()) {
      this.notificationService.showError('Error', 'Please enter the correct answer');
      return false;
    }
    return true;
  }

  removeQuestion(index: number): void {
    this.newQuiz.questions.splice(index, 1);
    // Update order numbers
    this.newQuiz.questions.forEach((q, i) => {
      q.order = i + 1;
    });
  }

  // Material Management
  openMaterialModal(module: Module): void {
    this.selectedModuleForMaterial = module;
    this.newMaterial = {
      title: '',
      description: '',
      type: 'VIDEO',
      url: '',
      order: 1,
      visible: true,
      moduleId: module.id
    };
    this.showMaterialModal = true;
  }

  closeMaterialModal(): void {
    this.showMaterialModal = false;
    this.selectedModuleForMaterial = null;
  }

  submitCreateMaterial(): void {
    // Validate form based on input type
    if (!this.newMaterial.title.trim()) {
      this.notificationService.showError('Error', 'Please enter a material title');
      return;
    }

    if (this.materialInputType === 'file' && !this.selectedFile) {
      this.notificationService.showError('Error', 'Please select a file to upload');
      return;
    }

    if (this.materialInputType === 'link' && !this.newMaterial.url.trim()) {
      this.notificationService.showError('Error', 'Please enter a URL');
      return;
    }

    this.creatingMaterial = true;

    if (this.materialInputType === 'file' && this.selectedFile) {
      // Handle file upload
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('title', this.newMaterial.title);
      formData.append('description', this.newMaterial.description || '');
      formData.append('type', this.newMaterial.type);
      formData.append('moduleId', this.newMaterial.moduleId);
      formData.append('order', this.newMaterial.order.toString());
      formData.append('visible', this.newMaterial.visible.toString());

      // Use the upload-and-create endpoint
      this.http.post('/api/v1/content/upload-and-create', formData).subscribe({
        next: (material) => {
          this.notificationService.showSuccess('Material Created', 'Material has been uploaded and created successfully');
          this.closeMaterialModal();
          this.loadModules();
          this.creatingMaterial = false;
        },
        error: (error) => {
          console.error('Error creating material:', error);
          this.notificationService.showError('Error', 'Failed to upload and create material');
          this.creatingMaterial = false;
        }
      });
    } else {
      // Handle link-based material
      this.http.post('/api/v1/content', {
        ...this.newMaterial,
        order: Number(this.newMaterial.order),
        visible: !!this.newMaterial.visible
      }).subscribe({
        next: (material) => {
          this.notificationService.showSuccess('Material Created', 'Material has been created successfully');
          this.closeMaterialModal();
          this.loadModules();
          this.creatingMaterial = false;
        },
        error: (error) => {
          console.error('Error creating material:', error);
          this.notificationService.showError('Error', 'Failed to create material');
          this.creatingMaterial = false;
        }
      });
    }
  }

  // Utility methods
  switchTab(tab: string): void {
    this.selectedTab = tab;
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case 'MULTIPLE_CHOICE': return 'Multiple Choice';
      case 'TRUE_FALSE': return 'True/False';
      case 'FILL_BLANK': return 'Fill in the Blank';
      case 'ESSAY': return 'Essay';
      default: return type;
    }
  }

  isInstructor(): boolean {
    return this.authService.currentUser?.role === 'instructor' || this.authService.currentUser?.role === 'admin';
  }

  // File Upload Methods
  onMaterialTypeChange(): void {
    // Reset file selection when switching between file and link
    if (this.materialInputType === 'link') {
      this.selectedFile = null;
    }
    // Auto-detect type based on file extension if file is selected
    if (this.materialInputType === 'file' && this.selectedFile) {
      this.newMaterial.type = this.detectFileType(this.selectedFile);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Auto-detect type based on file extension
      this.newMaterial.type = this.detectFileType(file);
      // Set title to filename if not already set
      if (!this.newMaterial.title) {
        this.newMaterial.title = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      }
    }
  }

  detectFileType(file: File): string {
    const extension = file.name.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return 'PDF';
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'mkv':
        return 'VIDEO';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return 'IMAGE';
      case 'doc':
      case 'docx':
      case 'txt':
      case 'rtf':
      case 'ppt':
      case 'pptx':
      case 'xls':
      case 'xlsx':
        return 'OTHER';
      default:
        return 'OTHER';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    // Reset material type to default
    this.newMaterial.type = 'VIDEO';
  }
} 
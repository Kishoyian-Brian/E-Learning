import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProgressService, CourseProgress } from '../../services/progress.service';
import { QuizService, QuizSubmission } from '../../services/quiz.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { CoursesService, Course, Module as CourseModule } from '../../services/courses.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  type: 'VIDEO' | 'READING' | 'QUIZ' | 'ASSIGNMENT' | 'DISCUSSION';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  isRequired: boolean;
  materials: ContentMaterial[];
  videoUrl?: string;
  readingContent?: string;
  quiz?: Quiz;
  assignment?: Assignment;
  discussion?: Discussion;
  completedAt?: Date;
  progress: number; // 0-100
  moduleId: string; // Added moduleId
}

interface ContentMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'DOCUMENT';
  url: string;
  size?: string;
  duration?: number;
  downloadCount: number;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number;
  attempts: number;
  maxAttempts: number;
}

interface QuizQuestion {
  id: string;
  text: string; // Changed from 'question' to 'text' to match backend
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY';
  options: string[];
  answer: string; // Changed from 'correctAnswer' to 'answer' to match backend
  order: number; // Added order to match backend
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  points: number;
  submissionType: 'FILE' | 'TEXT' | 'LINK';
  submitted: boolean;
  submittedAt?: Date;
  grade?: number;
  feedback?: string;
}

interface Discussion {
  id: string;
  title: string;
  description: string;
  posts: DiscussionPost[];
  isActive: boolean;
}

interface DiscussionPost {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  replies: DiscussionPost[];
}

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './content.html',
  styleUrl: './content.css'
})
export class Content implements OnInit {
  lessons: Lesson[] = [];
  selectedLesson: Lesson | null = null;
  currentLessonIndex = 0;
  loading = true;
  searchTerm = '';
  selectedType = 'all';
  selectedStatus = 'all';
  showCompleted = true;
  Math = Math;
  
  // Course and enrollment data
  courseId: string = '';
  enrollmentId: string = '';
  courseProgress: CourseProgress | null = null;
  error: string | null = null;
  courseTitle: string = '';
  courseFullyCompleted: boolean = false;

  // Add Material Modal properties
  showAddMaterialModal = false;
  materialTitle = '';
  materialDescription = '';
  materialType = 'DOCUMENT';
  materialUrl = '';
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  useFileUpload = true;

  @ViewChild('videoPlayer') videoPlayerRef: ElementRef<HTMLVideoElement> | undefined;
  videoProgressTimer: any = null;
  lastVideoProgress: number = 0;
  canMarkComplete: boolean = true;
  markCompleteReason: string = '';

  // Quiz-related properties
  quizStarted: boolean = false;
  quizCompleted: boolean = false;
  quizAnswers: { [questionId: string]: string } = {};
  quizResult: any = null;

  videoCompletionThreshold: number = 100; // Default, will be fetched from backend
  showPlayOverlay: boolean = true;
  youtubePlayer: any = null;
  youtubeProgressInterval: any = null;
  youtubeWatchedSeconds: number = 0;
  youtubeDuration: number = 0;
  lastYouTubeTime: number = 0;

  constructor(
    private progressService: ProgressService,
    private quizService: QuizService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private coursesService: CoursesService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Fetch video completion threshold from backend
    this.http.get<{ minVideoWatchPercentage: number }>('/api/v1/progress/settings').subscribe({
      next: (settings) => {
        this.videoCompletionThreshold = settings.minVideoWatchPercentage || 100;
      },
      error: () => {
        this.videoCompletionThreshold = 100;
      }
    });
    this.route.params.subscribe(params => {
      this.courseId = params['courseId'];
      this.enrollmentId = params['enrollmentId'];
      if (this.courseId) {
        this.loadContent();
        if (this.enrollmentId) {
          this.loadCourseProgress();
        }
      }
    });
    // Load YouTube API if not already loaded
    if (!window['YT']) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
    window['onYouTubeIframeAPIReady'] = () => {};
  }

  ngAfterViewInit(): void {
    // If a YouTube lesson is selected, initialize the player
    this.initYouTubePlayer();
  }

  loadCourseProgress(): void {
    this.progressService.getCourseProgress(this.enrollmentId).subscribe({
      next: (progress) => {
        this.courseProgress = progress;
        this.updateLessonsFromProgress(progress);
      },
      error: (error) => {
        console.error('Error loading course progress:', error);
        this.error = 'Failed to load course progress';
      }
    });
  }

  updateLessonsFromProgress(progress: CourseProgress): void {
    // Update lesson completion status based on backend progress
    this.lessons.forEach(lesson => {
      const moduleProgress = progress.modules.find(m => m.id === lesson.id);
      if (moduleProgress) {
        lesson.status = moduleProgress.completed ? 'COMPLETED' : 'NOT_STARTED';
        lesson.progress = moduleProgress.completed ? 100 : 0;
        lesson.completedAt = moduleProgress.completedAt;
      }
    });
  }

  loadContent(): void {
    this.loading = true;
    this.coursesService.getCourseDetails(this.courseId).subscribe(
      (course: any) => {
        this.courseTitle = course.title;
        // Flatten all materials from all modules as lessons
        const lessons: Lesson[] = [];
        (course.modules || []).forEach((mod: any) => {
          (mod.materials || []).forEach((mat: any) => {
            // Handle quiz materials from backend
            if (mat.type === 'QUIZ' && mat.quiz) {
              lessons.push({
                id: mat.id,
                moduleId: mod.id,
                title: mat.title,
                description: mat.description || '',
                duration: mat.quiz.timeLimit || 30, // Use quiz time limit as duration
        type: 'QUIZ',
        status: 'NOT_STARTED',
        isRequired: true,
        progress: 0,
                materials: [mat],
                completedAt: undefined,
        quiz: {
                  id: mat.quiz.id,
                  title: mat.quiz.title,
                  questions: mat.quiz.questions || [],
                  timeLimit: mat.quiz.timeLimit,
                  passingScore: 70, // Default passing score
          attempts: 0,
          maxAttempts: 3
        },
                assignment: undefined,
                discussion: undefined,
              });
            } else {
              // Handle regular materials
              lessons.push({
                id: mat.id,
                moduleId: mod.id,
                title: mat.title,
                description: mat.description || '',
                duration: 0, // Backend does not provide duration
                type: (mat.type || 'DOCUMENT').toUpperCase(),
        status: 'NOT_STARTED',
        isRequired: true,
        progress: 0,
                videoUrl: mat.type === 'VIDEO' ? mat.url : undefined,
                readingContent: mat.type === 'TEXT' ? mat.url : undefined,
                materials: [mat],
                completedAt: undefined,
                quiz: undefined,
                assignment: undefined,
                discussion: undefined,
              });
            }
          });
        });
        this.lessons = lessons;
        this.selectedLesson = this.lessons[0] || null;
        this.loading = false;
      },
      (err: any) => {
        console.error('Error loading course content:', err);
        this.error = 'Failed to load course content.';
    this.loading = false;
      }
    );
  }

  selectLesson(lesson: Lesson): void {
    this.selectedLesson = lesson;
    // Only track 'view' activity for non-quiz lessons
    if (lesson.type !== 'QUIZ') {
    this.trackActivity('view', lesson);
    }
    // If video, start tracking video progress
    if (lesson.type === 'VIDEO' && this.videoPlayerRef) {
      this.setupVideoProgressTracking();
    }
    // If YouTube, initialize player
    if (lesson.type === 'VIDEO' && this.isYouTubeVideo(lesson.videoUrl || '')) {
      setTimeout(() => this.initYouTubePlayer(), 0);
    }
    // Auto-start quiz if selected, but do NOT mark as complete
    if (lesson.type === 'QUIZ' && lesson.quiz) {
      this.quizStarted = true;
      this.quizCompleted = false;
      this.quizAnswers = {};
      this.quizResult = null;
      // Do NOT call completeLesson here
    }
    // Reset quiz state when selecting a different lesson
    if (lesson.type !== 'QUIZ' || !lesson.quiz) {
      this.quizStarted = false;
      this.quizCompleted = false;
      this.quizAnswers = {};
      this.quizResult = null;
    }
    this.checkCanMarkComplete(lesson);
  }

  getFilteredLessons(): Lesson[] {
    let filtered = [...this.lessons];

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(lesson => 
        lesson.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(lesson => lesson.type === this.selectedType);
    }

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(lesson => lesson.status === this.selectedStatus);
    }

    // Filter completed lessons
    if (!this.showCompleted) {
      filtered = filtered.filter(lesson => lesson.status !== 'COMPLETED');
    }

    return filtered;
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'VIDEO': return 'text-blue-500 bg-blue-100';
      case 'READING': return 'text-green-500 bg-green-100';
      case 'QUIZ': return 'text-purple-500 bg-purple-100';
      case 'ASSIGNMENT': return 'text-orange-500 bg-orange-100';
      case 'DISCUSSION': return 'text-pink-500 bg-pink-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'text-green-500 bg-green-100';
      case 'IN_PROGRESS': return 'text-yellow-500 bg-yellow-100';
      case 'NOT_STARTED': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'fas fa-check-circle';
      case 'IN_PROGRESS': return 'fas fa-play-circle';
      case 'NOT_STARTED': return 'fas fa-circle';
      default: return 'fas fa-circle';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'VIDEO': return 'fas fa-play';
      case 'READING': return 'fas fa-book';
      case 'QUIZ': return 'fas fa-question-circle';
      case 'ASSIGNMENT': return 'fas fa-tasks';
      case 'DISCUSSION': return 'fas fa-comments';
      default: return 'fas fa-file';
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'text-green-500';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-red-500';
  }

  getProgressBarColor(progress: number): string {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  startLesson(lesson: Lesson): void {
    this.selectLesson(lesson);
    lesson.status = 'IN_PROGRESS';
    this.trackActivity('start', lesson);
  }

  continueLesson(lesson: Lesson): void {
    this.selectLesson(lesson);
    lesson.status = 'IN_PROGRESS';
    this.trackActivity('continue', lesson);
  }

  completeLesson(lesson: Lesson): void {
    // Prevent marking as complete if this is a quiz and the quiz was not passed
    if (lesson.type === 'QUIZ' && this.quizResult && !this.quizResult.passed) {
      this.notificationService.showError('Quiz Not Passed', 'You must pass the quiz before marking as complete.');
      return;
    }
    if (!this.enrollmentId) {
      console.error('No enrollment ID available');
      return;
    }
    if (!this.canMarkComplete) {
      this.notificationService.showError('Cannot Complete', this.markCompleteReason || 'Requirements not met');
      return;
    }
    this.progressService.markModuleCompleted(this.enrollmentId, lesson.moduleId).subscribe({
      next: (progress) => {
        lesson.status = 'COMPLETED';
        lesson.progress = 100;
        lesson.completedAt = new Date();
        this.loadCourseProgress();
        if (this.courseProgress?.isCourseCompleted) {
          this.notificationService.showCourseCompletion(lesson.title);
        } else {
          this.notificationService.showModuleCompletion(lesson.title);
        }
        // Auto-show next quiz if available
        const currentIndex = this.lessons.findIndex(l => l.id === lesson.id);
        const nextLesson = this.lessons[currentIndex + 1];
        if (nextLesson && nextLesson.type === 'QUIZ' && nextLesson.quiz) {
          this.selectLesson(nextLesson);
          this.startQuiz(nextLesson);
        }
      },
      error: (error) => {
        console.error('Error completing lesson:', error);
        this.error = 'Failed to complete lesson';
      }
    });
  }

  // Track user activity for a lesson
  trackActivity(activityType: string, lesson: Lesson): void {
    if (!this.enrollmentId) return;
    const body = {
      moduleId: lesson.moduleId, // <-- use correct moduleId
      materialId: lesson.id,     // <-- use lesson/material id
      activityType,
      // Optionally add duration/progress/metadata
    };
    this.http.post('/api/v1/progress/track-activity', body).subscribe();
  }

  // Video progress tracking
  setupVideoProgressTracking(): void {
    if (!this.videoPlayerRef) return;
    const video = this.videoPlayerRef.nativeElement;
    if (this.videoProgressTimer) {
      clearInterval(this.videoProgressTimer);
    }
    this.videoProgressTimer = setInterval(() => {
      if (video.duration > 0) {
        const watchedPercentage = (video.currentTime / video.duration) * 100;
        if (Math.abs(watchedPercentage - this.lastVideoProgress) > 2) {
          this.lastVideoProgress = watchedPercentage;
          this.sendVideoProgress(this.selectedLesson!, video.currentTime, video.duration, watchedPercentage);
        }
        // Auto-complete if watched >= threshold and not already completed
        if (watchedPercentage >= this.videoCompletionThreshold && this.selectedLesson && this.selectedLesson.status !== 'COMPLETED') {
          this.completeLesson(this.selectedLesson);
          this.notificationService.showSuccess('Lesson Completed', 'You have finished watching the video!');
        }
      }
    }, 3000);
    // Also listen for the ended event for extra reliability
    video.onended = () => {
      if (this.selectedLesson && this.selectedLesson.status !== 'COMPLETED') {
        this.completeLesson(this.selectedLesson);
        this.notificationService.showSuccess('Lesson Completed', 'You have finished watching the video!');
      }
      this.showPlayOverlay = true;
    };
    // Show overlay if paused at start
    this.showPlayOverlay = video.paused;
  }

  sendVideoProgress(lesson: Lesson, currentTime: number, duration: number, watchedPercentage: number): void {
    if (!lesson) return;
    const body = {
      materialId: lesson.id,     // <-- use lesson/material id
      moduleId: lesson.moduleId, // <-- use correct moduleId
      currentTime,
      duration,
      watchedPercentage
    };
    this.http.post('/api/v1/progress/video-progress', body).subscribe();
  }

  // Validate completion before enabling Mark Complete
  checkCanMarkComplete(lesson: Lesson): void {
    if (!this.enrollmentId || !lesson.moduleId) {
      this.canMarkComplete = true;
      this.markCompleteReason = '';
      return;
    }
    this.http.get<any>(`/api/v1/progress/validation/${this.enrollmentId}/${lesson.moduleId}`).subscribe({
      next: (result) => {
        this.canMarkComplete = !!result.canComplete;
        this.markCompleteReason = result.reason || '';
      },
      error: (error) => {
        this.canMarkComplete = false;
        this.markCompleteReason = 'Unable to validate completion requirements.';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.videoProgressTimer) {
      clearInterval(this.videoProgressTimer);
    }
    if (this.youtubeProgressInterval) {
      clearInterval(this.youtubeProgressInterval);
    }
    if (this.youtubePlayer) {
      this.youtubePlayer.destroy();
    }
  }

  // Submit quiz and record completion
  // Quiz-related methods
  startQuiz(lesson: Lesson): void {
    if (!lesson.quiz) {
      return;
    }
    
    this.quizStarted = true;
    this.quizCompleted = false;
    this.quizAnswers = {};
    this.quizResult = null;
    
    // Track quiz start activity
    this.trackActivity('quiz', lesson);
  }

  cancelQuiz(): void {
    this.quizStarted = false;
    this.quizAnswers = {};
  }

  canSubmitQuiz(): boolean {
    if (!this.selectedLesson?.quiz) {
      return false;
    }
    
    // Check if all questions are answered
    const answeredQuestions = Object.keys(this.quizAnswers).length;
    const totalQuestions = this.selectedLesson.quiz.questions.length;
    
    return answeredQuestions === totalQuestions;
  }

  retakeQuiz(): void {
    this.quizStarted = true;
    this.quizCompleted = false;
    this.quizAnswers = {};
    this.quizResult = null;
  }

  submitQuiz(lesson: Lesson, answers: any): void {
    if (!lesson.quiz) {
      console.error('No quiz found for lesson');
      this.notificationService.showError('Error', 'No quiz found for this lesson');
      return;
    }

    console.log('Submitting quiz:', lesson.quiz.id);
    console.log('Answers:', answers);

    // First, start a quiz attempt
    this.quizService.startQuiz(lesson.quiz.id).subscribe({
      next: (attempt) => {
        console.log('Quiz attempt started:', attempt);
        
        // Then submit the answers
    const submission: QuizSubmission = {
          quizId: lesson.quiz!.id,
      answers: Object.keys(answers).map(questionId => ({
        questionId,
        response: answers[questionId]
      }))
    };

        console.log('Submitting answers for attempt:', attempt.id);
        console.log('Submission object:', submission);

        // Submit the attempt
        this.http.post(`http://localhost:3000/api/v1/quizzes/attempts/${attempt.id}/submit`, {
          answers: submission.answers
        }).subscribe({
          next: (result: any) => {
            console.log('Quiz submission successful:', result);
        this.quizCompleted = true;
        this.quizResult = result;
        
        // Update quiz attempts
        if (lesson.quiz) {
          lesson.quiz.attempts++;
        }
        
        // Record quiz completion in progress
            this.http.post('http://localhost:3000/api/v1/progress/quiz-completion', {
          quizId: lesson.quiz?.id,
          moduleId: lesson.moduleId,
          score: result.score,
          maxScore: result.maxScore ?? lesson.quiz?.questions.length ?? 0,
          passed: result.passed
            }).subscribe({
              next: () => {
                console.log('Quiz completion recorded successfully');
                // Force progress bar and course completion to 100% if passed
                if (result.passed) {
                  lesson.status = 'COMPLETED';
                  lesson.progress = 100;
                  lesson.completedAt = new Date();
                  if (this.courseProgress) {
                    this.courseProgress.moduleProgressPercentage = 100;
                    this.courseProgress.quizProgressPercentage = 100;
                    this.courseProgress.overallProgressPercentage = 100;
                    this.courseProgress.isCourseCompleted = true;
                  }
                  // Redirect to My Courses to view certificate
                  setTimeout(() => {
                    this.router.navigate(['/mycourses'], { queryParams: { completed: this.courseId } });
                  }, 1000);
                } else {
                  // Reload progress and update UI for failed attempt
          this.loadCourseProgress();
          this.checkCanMarkComplete(lesson);
                }
              },
              error: (progressError) => {
                console.error('Error recording quiz completion:', progressError);
                // Still show quiz result even if progress recording fails
                this.notificationService.showError('Warning', 'Quiz submitted but progress may not be saved');
              }
        });
      },
      error: (error) => {
            console.error('Error submitting quiz answers:', error);
            this.error = 'Failed to submit quiz answers';
            this.notificationService.showError('Submission Failed', 'Failed to submit quiz answers. Please try again.');
          }
        });
      },
      error: (error) => {
        console.error('Error starting quiz attempt:', error);
        this.error = 'Failed to start quiz attempt';
        this.notificationService.showError('Error', 'Failed to start quiz attempt. Please try again.');
      }
    });
  }

  // Remove this method as we're using the notification service now

  downloadMaterial(material: ContentMaterial): void {
    console.log('Downloading material:', material.id);
    // TODO: Handle file download
  }

  getTotalLessons(): number {
    return this.lessons.length;
  }

  getCompletedLessons(): number {
    return this.lessons.filter(lesson => lesson.status === 'COMPLETED').length;
  }

  getInProgressLessons(): number {
    return this.lessons.filter(lesson => lesson.status === 'IN_PROGRESS').length;
  }

  getTotalProgress(): number {
    if (this.lessons.length === 0) return 0;
    const totalProgress = this.lessons.reduce((sum, lesson) => sum + lesson.progress, 0);
    return Math.round(totalProgress / this.lessons.length);
  }

  getTotalDuration(): number {
    return this.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  }

  getCompletedDuration(): number {
    return this.lessons
      .filter(lesson => lesson.status === 'COMPLETED')
      .reduce((sum, lesson) => sum + lesson.duration, 0);
  }

  // Add Material Modal methods
  openAddMaterialModal(): void {
    this.showAddMaterialModal = true;
    this.resetMaterialForm();
  }

  closeAddMaterialModal(): void {
    this.showAddMaterialModal = false;
    this.resetMaterialForm();
  }

  resetMaterialForm(): void {
    this.materialTitle = '';
    this.materialDescription = '';
    this.materialType = 'DOCUMENT';
    this.materialUrl = '';
    this.selectedFile = null;
    this.isUploading = false;
    this.uploadProgress = 0;
    this.useFileUpload = true;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Auto-detect type based on file extension
      this.materialType = this.detectFileType(file);
      // Set title to filename if not already set
      if (!this.materialTitle) {
        this.materialTitle = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
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
        return 'VIDEO';
      case 'mp3':
      case 'wav':
      case 'aac':
        return 'AUDIO';
      case 'doc':
      case 'docx':
      case 'txt':
      case 'rtf':
        return 'DOCUMENT';
      default:
        return 'DOCUMENT';
    }
  }

  async addMaterial(): Promise<void> {
    if (!this.selectedLesson) {
      this.notificationService.showError('Error', 'No lesson selected');
      return;
    }

    if (!this.materialTitle.trim()) {
      this.notificationService.showError('Validation Error', 'Material title is required');
      return;
    }

    if (this.useFileUpload && !this.selectedFile) {
      this.notificationService.showError('Validation Error', 'Please select a file to upload');
      return;
    }

    if (!this.useFileUpload && !this.materialUrl.trim()) {
      this.notificationService.showError('Validation Error', 'Material URL is required');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    try {
      if (this.useFileUpload && this.selectedFile) {
        // Upload file and create material
        await this.uploadFileAndCreateMaterial();
      } else {
        // Create material with URL
        await this.createMaterialWithUrl();
      }

      this.notificationService.showSuccess('Success', 'Material added successfully');
      this.closeAddMaterialModal();
      this.loadContent(); // Reload content to show new material
    } catch (error) {
      console.error('Error adding material:', error);
      this.notificationService.showError('Upload Failed', 'Failed to add material');
    } finally {
      this.isUploading = false;
      this.uploadProgress = 0;
    }
  }

  private async uploadFileAndCreateMaterial(): Promise<void> {
    if (!this.selectedFile || !this.selectedLesson) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.materialTitle);
    formData.append('description', this.materialDescription);
    formData.append('type', this.materialType);
    formData.append('moduleId', this.selectedLesson.moduleId);
    formData.append('order', '1');
    formData.append('visible', 'true');

    const headers = new HttpHeaders();
    // Add auth token if available
    const token = this.authService.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return new Promise((resolve, reject) => {
      this.http.post('/api/v1/content/upload-and-create', formData, { headers })
        .subscribe({
          next: (response: any) => {
            console.log('Material created:', response);
            resolve();
          },
          error: (error) => {
            console.error('Upload error:', error);
            reject(error);
          }
        });
    });
  }

  private async createMaterialWithUrl(): Promise<void> {
    if (!this.selectedLesson) return;

    const materialData = {
      title: this.materialTitle,
      description: this.materialDescription,
      type: this.materialType,
      moduleId: this.selectedLesson.moduleId,
      order: 1,
      visible: true,
      url: this.materialUrl
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Add auth token if available
    const token = this.authService.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return new Promise((resolve, reject) => {
      this.http.post('/api/v1/content', materialData, { headers })
        .subscribe({
          next: (response: any) => {
            console.log('Material created:', response);
            resolve();
          },
          error: (error) => {
            console.error('Create error:', error);
            reject(error);
          }
        });
    });
  }

  toggleUploadMethod(): void {
    this.useFileUpload = !this.useFileUpload;
    this.selectedFile = null;
    this.materialUrl = '';
  }

  isVideoEmbedUrl(url: string): boolean {
    if (!url) return false;
    // Check for YouTube or Vimeo links
    return /youtube\.com\/watch\?v=|youtu\.be\//.test(url) || /vimeo\.com\//.test(url);
  }

  getSafeEmbedUrl(url: string): SafeResourceUrl {
    if (!url) return '';
    let embedUrl = url;
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  playVideo(): void {
    if (this.videoPlayerRef && this.videoPlayerRef.nativeElement) {
      this.videoPlayerRef.nativeElement.play();
    }
  }

  onVideoPlay(): void {
    this.showPlayOverlay = false;
  }

  onVideoPause(): void {
    // Only show overlay if not ended
    if (this.videoPlayerRef && this.videoPlayerRef.nativeElement) {
      const video = this.videoPlayerRef.nativeElement;
      if (video.currentTime < video.duration) {
        this.showPlayOverlay = true;
      }
    }
  }

  onVideoLoaded(): void {
    this.showPlayOverlay = true;
  }

  isYouTubeVideo(url: string): boolean {
    return /youtube\.com\/watch\?v=|youtu\.be\//.test(url);
  }

  isVimeoVideo(url: string): boolean {
    return /vimeo\.com\//.test(url);
  }

  initYouTubePlayer(): void {
    if (!this.selectedLesson || !this.isYouTubeVideo(this.selectedLesson.videoUrl || '')) return;
    // Clean up previous player
    if (this.youtubePlayer) {
      this.youtubePlayer.destroy();
      this.youtubePlayer = null;
    }
    if (this.youtubeProgressInterval) {
      clearInterval(this.youtubeProgressInterval);
      this.youtubeProgressInterval = null;
    }
    // Get video ID
    const url = this.selectedLesson.videoUrl || '';
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (!ytMatch) return;
    const videoId = ytMatch[1];
    // Wait for YT API
    const tryInit = () => {
      if (window['YT'] && window['YT'].Player) {
        this.youtubePlayer = new window['YT'].Player('youtube-player', {
          videoId,
          events: {
            'onReady': (event: any) => {
              this.youtubeDuration = event.target.getDuration();
              this.youtubeWatchedSeconds = 0;
              this.lastYouTubeTime = 0;
              this.startYouTubeProgressTracking();
            },
            'onStateChange': (event: any) => {
              if (event.data === window['YT'].PlayerState.PLAYING) {
                this.startYouTubeProgressTracking();
              } else if (event.data === window['YT'].PlayerState.PAUSED || event.data === window['YT'].PlayerState.ENDED) {
                if (this.youtubeProgressInterval) {
                  clearInterval(this.youtubeProgressInterval);
                  this.youtubeProgressInterval = null;
                }
                if (event.data === window['YT'].PlayerState.ENDED) {
                  this.youtubeWatchedSeconds = this.youtubeDuration;
                  this.checkYouTubeCompletion();
                }
              }
            }
          },
          playerVars: {
            rel: 0,
            modestbranding: 1
          }
        });
      } else {
        setTimeout(tryInit, 200);
      }
    };
    tryInit();
  }

  startYouTubeProgressTracking(): void {
    if (this.youtubeProgressInterval) {
      clearInterval(this.youtubeProgressInterval);
    }
    this.youtubeProgressInterval = setInterval(() => {
      if (this.youtubePlayer && this.youtubePlayer.getCurrentTime && this.youtubePlayer.getDuration) {
        const currentTime = this.youtubePlayer.getCurrentTime();
        const duration = this.youtubePlayer.getDuration();
        if (duration > 0) {
          // Only count forward progress
          if (currentTime > this.lastYouTubeTime) {
            this.youtubeWatchedSeconds += (currentTime - this.lastYouTubeTime);
          }
          this.lastYouTubeTime = currentTime;
          const watchedPercentage = (this.youtubeWatchedSeconds / duration) * 100;
          this.sendVideoProgress(this.selectedLesson!, currentTime, duration, watchedPercentage);
          this.checkYouTubeCompletion();
        }
      }
    }, 2000);
  }

  checkYouTubeCompletion(): void {
    if (!this.selectedLesson) return;
    const watchedPercentage = (this.youtubeWatchedSeconds / (this.youtubeDuration || 1)) * 100;
    if (watchedPercentage >= this.videoCompletionThreshold && this.selectedLesson.status !== 'COMPLETED') {
      this.completeLesson(this.selectedLesson);
      this.notificationService.showSuccess('Lesson Completed', 'You have finished watching the video!');
      if (this.youtubeProgressInterval) {
        clearInterval(this.youtubeProgressInterval);
      }
    }
  }
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

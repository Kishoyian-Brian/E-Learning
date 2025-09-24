import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Lesson {
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
  order: number;
  courseId: string;
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'DOCUMENT';
  url: string;
  size?: string;
  duration?: number;
  downloadCount: number;
  lessonId: string;
  uploadedAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number;
  attempts: number;
  maxAttempts: number;
  isRandomized: boolean;
  showResults: boolean;
  allowReview: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

export interface Assignment {
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
  attachments?: string[];
  rubric?: AssignmentRubric[];
}

export interface AssignmentRubric {
  criterion: string;
  points: number;
  description: string;
}

export interface Discussion {
  id: string;
  title: string;
  description: string;
  posts: DiscussionPost[];
  isActive: boolean;
  isModerated: boolean;
  allowAnonymous: boolean;
}

export interface DiscussionPost {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: Date;
  replies: DiscussionPost[];
  isEdited: boolean;
  editedAt?: Date;
  likes: number;
  isPinned: boolean;
}

export interface ContentFilters {
  courseId?: string;
  type?: string;
  status?: string;
  search?: string;
  instructorId?: string;
}

export interface ContentStats {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  totalDuration: number;
  completedDuration: number;
  averageProgress: number;
  materialsCount: number;
  quizzesCount: number;
  assignmentsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private lessons: Lesson[] = [
    {
      id: '1',
      title: 'Introduction to Web Development',
      description: 'Learn the basics of HTML, CSS, and JavaScript',
      duration: 45,
      type: 'VIDEO',
      status: 'COMPLETED',
      isRequired: true,
      progress: 100,
      order: 1,
      courseId: 'web-dev-101',
      instructorId: 'instructor-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      videoUrl: 'https://example.com/video1.mp4',
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      materials: [
        {
          id: '1',
          title: 'Web Development Basics PDF',
          type: 'PDF',
          url: 'https://example.com/basics.pdf',
          size: '2.5 MB',
          downloadCount: 45,
          lessonId: '1',
          uploadedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          title: 'Code Examples',
          type: 'DOCUMENT',
          url: 'https://example.com/examples.zip',
          size: '1.2 MB',
          downloadCount: 32,
          lessonId: '1',
          uploadedAt: new Date('2024-01-02')
        }
      ]
    },
    {
      id: '2',
      title: 'HTML Fundamentals',
      description: 'Master HTML structure, elements, and semantic markup',
      duration: 60,
      type: 'VIDEO',
      status: 'IN_PROGRESS',
      isRequired: true,
      progress: 75,
      order: 2,
      courseId: 'web-dev-101',
      instructorId: 'instructor-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-20'),
      videoUrl: 'https://example.com/video2.mp4',
      materials: [
        {
          id: '3',
          title: 'HTML Cheat Sheet',
          type: 'PDF',
          url: 'https://example.com/html-cheat.pdf',
          size: '800 KB',
          downloadCount: 28,
          lessonId: '2',
          uploadedAt: new Date('2024-01-03')
        }
      ]
    },
    {
      id: '3',
      title: 'CSS Styling Basics',
      description: 'Learn CSS selectors, properties, and layout techniques',
      duration: 90,
      type: 'READING',
      status: 'NOT_STARTED',
      isRequired: true,
      progress: 0,
      order: 3,
      courseId: 'web-dev-101',
      instructorId: 'instructor-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      readingContent: 'CSS is a style sheet language used for describing the presentation of a document written in HTML. CSS describes how elements should be rendered on screen, on paper, in speech, or on other media.',
      materials: [
        {
          id: '4',
          title: 'CSS Reference Guide',
          type: 'PDF',
          url: 'https://example.com/css-guide.pdf',
          size: '1.5 MB',
          downloadCount: 15,
          lessonId: '3',
          uploadedAt: new Date('2024-01-04')
        }
      ]
    },
    {
      id: '4',
      title: 'JavaScript Fundamentals Quiz',
      description: 'Test your knowledge of JavaScript basics',
      duration: 30,
      type: 'QUIZ',
      status: 'NOT_STARTED',
      isRequired: true,
      progress: 0,
      order: 4,
      courseId: 'web-dev-101',
      instructorId: 'instructor-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      materials: [],
      quiz: {
        id: '1',
        title: 'JavaScript Basics Quiz',
        questions: [
          {
            id: '1',
            question: 'What is the correct way to declare a variable in JavaScript?',
            type: 'MULTIPLE_CHOICE',
            options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
            correctAnswer: 'var x = 5;',
            points: 10,
            explanation: 'The var keyword is used to declare variables in JavaScript.'
          },
          {
            id: '2',
            question: 'JavaScript is a case-sensitive language.',
            type: 'TRUE_FALSE',
            correctAnswer: 'true',
            points: 5,
            explanation: 'JavaScript is indeed case-sensitive, meaning var and Var are different.'
          }
        ],
        timeLimit: 30,
        passingScore: 70,
        attempts: 0,
        maxAttempts: 3,
        isRandomized: false,
        showResults: true,
        allowReview: true
      }
    },
    {
      id: '5',
      title: 'Build Your First Website',
      description: 'Create a complete website using HTML, CSS, and JavaScript',
      duration: 120,
      type: 'ASSIGNMENT',
      status: 'NOT_STARTED',
      isRequired: true,
      progress: 0,
      order: 5,
      courseId: 'web-dev-101',
      instructorId: 'instructor-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      materials: [],
      assignment: {
        id: '1',
        title: 'Personal Portfolio Website',
        description: 'Create a personal portfolio website with at least 3 pages including a home page, about page, and contact page. Use HTML, CSS, and JavaScript to make it interactive.',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        points: 100,
        submissionType: 'FILE',
        submitted: false,
        rubric: [
          { criterion: 'HTML Structure', points: 25, description: 'Proper HTML5 semantic markup' },
          { criterion: 'CSS Styling', points: 30, description: 'Responsive design and modern styling' },
          { criterion: 'JavaScript Functionality', points: 25, description: 'Interactive features and smooth user experience' },
          { criterion: 'Content Quality', points: 20, description: 'Professional content and presentation' }
        ]
      }
    },
    {
      id: '6',
      title: 'Web Development Discussion',
      description: 'Share your thoughts and ask questions about web development',
      duration: 45,
      type: 'DISCUSSION',
      status: 'NOT_STARTED',
      isRequired: false,
      progress: 0,
      order: 6,
      courseId: 'web-dev-101',
      instructorId: 'instructor-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      materials: [],
      discussion: {
        id: '1',
        title: 'Web Development Best Practices',
        description: 'Discuss modern web development practices and tools. Share your experiences and ask questions.',
        posts: [
          {
            id: '1',
            author: 'John Doe',
            authorId: 'user-1',
            content: 'What are your favorite CSS frameworks? I\'ve been using Bootstrap but want to explore alternatives.',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            replies: [],
            isEdited: false,
            likes: 5,
            isPinned: false
          }
        ],
        isActive: true,
        isModerated: true,
        allowAnonymous: false
      }
    }
  ];

  constructor() {}

  getLessons(filters?: ContentFilters): Observable<Lesson[]> {
    let filteredLessons = [...this.lessons];

    if (filters?.courseId) {
      filteredLessons = filteredLessons.filter(lesson => lesson.courseId === filters.courseId);
    }

    if (filters?.type && filters.type !== 'all') {
      filteredLessons = filteredLessons.filter(lesson => lesson.type === filters.type);
    }

    if (filters?.status && filters.status !== 'all') {
      filteredLessons = filteredLessons.filter(lesson => lesson.status === filters.status);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredLessons = filteredLessons.filter(lesson => 
        lesson.title.toLowerCase().includes(searchTerm) ||
        lesson.description.toLowerCase().includes(searchTerm)
      );
    }

    if (filters?.instructorId) {
      filteredLessons = filteredLessons.filter(lesson => lesson.instructorId === filters.instructorId);
    }

    // Sort by order
    filteredLessons.sort((a, b) => a.order - b.order);

    return of(filteredLessons).pipe(delay(500));
  }

  getLessonById(id: string): Observable<Lesson | null> {
    const lesson = this.lessons.find(l => l.id === id);
    return of(lesson || null).pipe(delay(300));
  }

  createLesson(lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Observable<Lesson> {
    const newLesson: Lesson = {
      ...lessonData,
      id: (this.lessons.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.lessons.push(newLesson);
    return of(newLesson).pipe(delay(800));
  }

  updateLesson(id: string, updates: Partial<Lesson>): Observable<Lesson | null> {
    const lessonIndex = this.lessons.findIndex(l => l.id === id);
    if (lessonIndex === -1) {
      return of(null).pipe(delay(300));
    }

    this.lessons[lessonIndex] = { 
      ...this.lessons[lessonIndex], 
      ...updates, 
      updatedAt: new Date() 
    };
    return of(this.lessons[lessonIndex]).pipe(delay(600));
  }

  deleteLesson(id: string): Observable<boolean> {
    const lessonIndex = this.lessons.findIndex(l => l.id === id);
    if (lessonIndex === -1) {
      return of(false).pipe(delay(300));
    }

    this.lessons.splice(lessonIndex, 1);
    return of(true).pipe(delay(500));
  }

  updateLessonProgress(id: string, progress: number): Observable<Lesson | null> {
    const lesson = this.lessons.find(l => l.id === id);
    if (!lesson) {
      return of(null).pipe(delay(300));
    }

    const updates: Partial<Lesson> = { progress };
    
    if (progress === 100 && lesson.status !== 'COMPLETED') {
      updates.status = 'COMPLETED';
      updates.completedAt = new Date();
    } else if (progress > 0 && lesson.status === 'NOT_STARTED') {
      updates.status = 'IN_PROGRESS';
    }

    return this.updateLesson(id, updates);
  }

  startLesson(id: string): Observable<Lesson | null> {
    return this.updateLesson(id, { 
      status: 'IN_PROGRESS', 
      progress: 0 
    });
  }

  completeLesson(id: string): Observable<Lesson | null> {
    return this.updateLesson(id, { 
      status: 'COMPLETED', 
      progress: 100, 
      completedAt: new Date() 
    });
  }

  getContentStats(courseId?: string): Observable<ContentStats> {
    const lessons = courseId 
      ? this.lessons.filter(l => l.courseId === courseId)
      : this.lessons;

    const stats: ContentStats = {
      totalLessons: lessons.length,
      completedLessons: lessons.filter(l => l.status === 'COMPLETED').length,
      inProgressLessons: lessons.filter(l => l.status === 'IN_PROGRESS').length,
      totalDuration: lessons.reduce((sum, l) => sum + l.duration, 0),
      completedDuration: lessons
        .filter(l => l.status === 'COMPLETED')
        .reduce((sum, l) => sum + l.duration, 0),
      averageProgress: lessons.length > 0 
        ? Math.round(lessons.reduce((sum, l) => sum + l.progress, 0) / lessons.length)
        : 0,
      materialsCount: lessons.reduce((sum, l) => sum + l.materials.length, 0),
      quizzesCount: lessons.filter(l => l.type === 'QUIZ').length,
      assignmentsCount: lessons.filter(l => l.type === 'ASSIGNMENT').length
    };

    return of(stats).pipe(delay(400));
  }

  addMaterial(lessonId: string, material: Omit<ContentMaterial, 'id' | 'uploadedAt'>): Observable<ContentMaterial> {
    const newMaterial: ContentMaterial = {
      ...material,
      id: Date.now().toString(),
      uploadedAt: new Date()
    };

    const lessonIndex = this.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex !== -1) {
      this.lessons[lessonIndex].materials.push(newMaterial);
    }

    return of(newMaterial).pipe(delay(600));
  }

  removeMaterial(lessonId: string, materialId: string): Observable<boolean> {
    const lessonIndex = this.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) {
      return of(false).pipe(delay(300));
    }

    const materialIndex = this.lessons[lessonIndex].materials.findIndex(m => m.id === materialId);
    if (materialIndex === -1) {
      return of(false).pipe(delay(300));
    }

    this.lessons[lessonIndex].materials.splice(materialIndex, 1);
    return of(true).pipe(delay(400));
  }

  downloadMaterial(materialId: string): Observable<void> {
    // Simulate download tracking
    this.lessons.forEach(lesson => {
      lesson.materials.forEach(material => {
        if (material.id === materialId) {
          material.downloadCount++;
        }
      });
    });

    return of(void 0).pipe(delay(200));
  }

  submitQuiz(lessonId: string, answers: any): Observable<{ score: number; passed: boolean; feedback: any }> {
    const lesson = this.lessons.find(l => l.id === lessonId);
    if (!lesson || !lesson.quiz) {
      return of({ score: 0, passed: false, feedback: {} }).pipe(delay(300));
    }

    // Simulate quiz grading
    const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
    const passed = score >= lesson.quiz.passingScore;

    // Update quiz attempts
    lesson.quiz.attempts++;

    return of({ 
      score, 
      passed, 
      feedback: { 
        totalQuestions: lesson.quiz.questions.length,
        correctAnswers: Math.floor((score / 100) * lesson.quiz.questions.length)
      } 
    }).pipe(delay(1000));
  }

  submitAssignment(lessonId: string, submission: any): Observable<Assignment> {
    const lesson = this.lessons.find(l => l.id === lessonId);
    if (!lesson || !lesson.assignment) {
      throw new Error('Assignment not found');
    }

    lesson.assignment.submitted = true;
    lesson.assignment.submittedAt = new Date();

    return of(lesson.assignment).pipe(delay(800));
  }

  addDiscussionPost(lessonId: string, post: Omit<DiscussionPost, 'id' | 'timestamp'>): Observable<DiscussionPost> {
    const lesson = this.lessons.find(l => l.id === lessonId);
    if (!lesson || !lesson.discussion) {
      throw new Error('Discussion not found');
    }

    const newPost: DiscussionPost = {
      ...post,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    lesson.discussion.posts.push(newPost);
    return of(newPost).pipe(delay(500));
  }

  reorderLessons(lessonIds: string[]): Observable<Lesson[]> {
    lessonIds.forEach((id, index) => {
      const lesson = this.lessons.find(l => l.id === id);
      if (lesson) {
        lesson.order = index + 1;
        lesson.updatedAt = new Date();
      }
    });

    return of([...this.lessons]).pipe(delay(600));
  }

  duplicateLesson(id: string): Observable<Lesson> {
    const originalLesson = this.lessons.find(l => l.id === id);
    if (!originalLesson) {
      throw new Error('Lesson not found');
    }

    const duplicatedLesson: Lesson = {
      ...originalLesson,
      id: Date.now().toString(),
      title: `${originalLesson.title} (Copy)`,
      status: 'NOT_STARTED',
      progress: 0,
      order: this.lessons.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: undefined
    };

    this.lessons.push(duplicatedLesson);
    return of(duplicatedLesson).pipe(delay(700));
  }
} 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  timeLimit?: number;
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
  QuizCompletion: QuizCompletion[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY';
  options: string[];
  answer: string;
  order: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  answers: Answer[];
}

export interface Answer {
  id: string;
  quizAttemptId: string;
  questionId: string;
  response: string;
  isCorrect?: boolean;
}

export interface QuizCompletion {
  id: string;
  userId: string;
  quizId: string;
  passed: boolean;
  score: number;
  maxScore: number;
  completedAt: Date;
}

export interface QuizSubmission {
  quizId: string;
  answers: {
    questionId: string;
    response: string;
  }[];
}

export interface QuizResult {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:3000/api/v1/quizzes';

  constructor(private http: HttpClient) { }

  // Get all quizzes
  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}`);
  }

  // Get quiz by ID
  getQuizById(id: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${id}`);
  }

  // Get quizzes for a course
  getQuizzesByCourse(courseId: string): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/course/${courseId}`);
  }

  // Start quiz attempt
  startQuiz(quizId: string): Observable<QuizAttempt> {
    return this.http.post<QuizAttempt>(`${this.apiUrl}/${quizId}/start`, {});
  }

  // Get quiz attempts for current user
  getMyAttempts(): Observable<QuizAttempt[]> {
    return this.http.get<QuizAttempt[]>(`${this.apiUrl}/my-attempts`);
  }

  // Get quiz attempts for specific quiz
  getQuizAttempts(quizId: string): Observable<QuizAttempt[]> {
    return this.http.get<QuizAttempt[]>(`${this.apiUrl}/${quizId}/attempts`);
  }

  // Get quiz completion status
  getQuizCompletion(quizId: string): Observable<QuizCompletion | null> {
    return this.http.get<QuizCompletion | null>(`${this.apiUrl}/${quizId}/completion`);
  }

  // Create quiz (instructor only)
  createQuiz(quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.apiUrl}`, quiz);
  }

  // Update quiz (instructor only)
  updateQuiz(id: string, quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.patch<Quiz>(`${this.apiUrl}/${id}`, quiz);
  }

  // Delete quiz (instructor only)
  deleteQuiz(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 
export interface QuizWithQuestions {
  id: string;
  title: string;
  courseId: string;
  timeLimit: number | null;
  createdAt: Date;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  answer: string;
  order: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  startedAt: Date;
  completedAt: Date | null;
  score: number | null;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  questionId: string;
  response: string;
  isCorrect: boolean | null;
}

export interface QuizResult {
  quizId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  percentage: number;
} 
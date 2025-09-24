export interface Progress {
  id: string;
  enrollmentId: string;
  moduleId: string;
  completed: boolean;
  completedAt?: Date | null;
}

export interface ProgressWithDetails extends Progress {
  enrollment: {
    id: string;
    userId: string;
    courseId: string;
    enrolledAt: Date;
    course: {
      id: string;
      title: string;
      description: string;
    };
  };
  module: {
    id: string;
    title: string;
    description: string;
    order: number;
  };
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  totalModules: number;
  completedModules: number;
  moduleProgressPercentage: number;
  totalQuizzes: number;
  passedQuizzes: number;
  quizProgressPercentage: number;
  overallProgressPercentage: number;
  isCourseCompleted: boolean;
  lastCompletedAt?: Date | null;
  modules: {
    id: string;
    title: string;
    order: number;
    completed: boolean;
    completedAt?: Date | null;
  }[];
  quizzes: {
    id: string;
    title: string;
    passed: boolean;
    score?: number | null;
    maxScore?: number | null;
    completedAt?: Date | null;
  }[];
} 
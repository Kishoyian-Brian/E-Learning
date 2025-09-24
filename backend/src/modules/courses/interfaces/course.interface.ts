export interface Category {
  id: string;
  name: string;
}

export interface DifficultyLevel {
  id: string;
  name: string;
}

export interface CourseWithInstructor {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: DifficultyLevel;
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CourseWithCounts extends CourseWithInstructor {
  _count: {
    enrollments: number;
    modules: number;
    reviews?: number;
  };
}

export interface CourseWithModules extends CourseWithInstructor {
  modules: ModuleWithMaterials[];
  _count: {
    enrollments: number;
    modules: number;
    reviews: number;
  };
}

export interface ModuleWithMaterials {
  id: string;
  title: string;
  description: string;
  courseId: string;
  order: number;
  materials: Material[];
  _count: {
    materials: number;
  };
}

export interface Material {
  id: string;
  type: string;
  url: string;
  moduleId: string;
  visible: boolean;
}

export interface CourseWithEnrollments extends CourseWithInstructor {
  enrollments: EnrollmentWithProgress[];
  _count: {
    modules: number;
  };
}

export interface EnrollmentWithProgress {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  progress: Progress[];
}

export interface Progress {
  id: string;
  enrollmentId: string;
  moduleId: string;
  completed: boolean;
  completedAt: Date | null;
}

export type CourseSearchResult = CourseWithCounts;

export interface CreateCourseRequest {
  title: string;
  description: string;
  categoryId: string;
  difficultyId: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  categoryId?: string;
  difficultyId?: string;
}

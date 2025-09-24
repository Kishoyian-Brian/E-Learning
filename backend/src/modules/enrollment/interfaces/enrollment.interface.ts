export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
}

export interface EnrollmentWithCourse extends Enrollment {
  course: {
    id: string;
    title: string;
    description: string;
    instructor: {
      id: string;
      name: string;
      email: string;
    };
    category: {
      id: string;
      name: string;
    };
    difficulty: {
      id: string;
      name: string;
    };
    _count: {
      modules: number;
      enrollments: number;
    };
  };
} 
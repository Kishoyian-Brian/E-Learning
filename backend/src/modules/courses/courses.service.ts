import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, User } from '@prisma/client';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  CourseWithInstructor,
  CourseWithCounts,
  CourseWithModules,
  CourseWithEnrollments,
  CourseSearchResult,
} from './interfaces';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createCourseDto: CreateCourseDto,
    instructor: User | JwtPayload,
  ): Promise<CourseWithInstructor> {
    const instructorId = 'id' in instructor ? instructor.id : instructor.sub;
    
    return this.prisma.course.create({
      data: {
        ...createCourseDto,
        instructorId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        difficulty: true,
      },
    });
  }

  async findAll(): Promise<CourseWithCounts[]> {
    return this.prisma.course.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        difficulty: true,
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<CourseWithModules> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        difficulty: true,
        modules: {
          include: {
            materials: true,
            _count: {
              select: {
                materials: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Get quizzes for this course
    const quizzes = await this.prisma.quiz.findMany({
      where: { courseId: id },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Add quizzes as materials to each module
    const modulesWithQuizzes = course.modules.map(module => {
      const quizMaterials = quizzes.map((quiz, index) => ({
        id: `quiz-${quiz.id}`,
        type: 'QUIZ',
        url: `/quizzes/${quiz.id}`,
        moduleId: module.id,
        visible: true,
        createdAt: quiz.createdAt,
        description: `Quiz: ${quiz.title}`,
        order: module.materials.length + index + 1,
        title: quiz.title,
        updatedAt: quiz.createdAt,
        // Include quiz data for frontend
        quiz: {
          id: quiz.id,
          title: quiz.title,
          timeLimit: quiz.timeLimit,
          questions: quiz.questions,
          courseId: quiz.courseId
        }
      }));

      return {
        ...module,
        materials: [...module.materials, ...quizMaterials],
        _count: {
          ...module._count,
          materials: module._count.materials + quizMaterials.length
        }
      };
    });

    return {
      ...course,
      modules: modulesWithQuizzes
    };
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    user: User | JwtPayload,
  ): Promise<CourseWithInstructor> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { instructor: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const userId = 'id' in user ? user.id : user.sub;
    const userRole = 'role' in user ? user.role : (user as JwtPayload).role;

    // Only instructor or admin can update the course
    if (course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own courses');
    }

    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        difficulty: true,
      },
    });
  }

  async remove(id: string, user: User | JwtPayload): Promise<void> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { instructor: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const userId = 'id' in user ? user.id : user.sub;
    const userRole = 'role' in user ? user.role : (user as JwtPayload).role;

    // Only instructor or admin can delete the course
    if (course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.prisma.course.delete({
      where: { id },
    });
  }

  async findInstructorCourses(instructorId: string): Promise<CourseWithCounts[]> {
    return this.prisma.course.findMany({
      where: { instructorId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        difficulty: true,
        _count: {
          select: {
            enrollments: true,
            modules: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findEnrolledCourses(userId: string): Promise<CourseWithEnrollments[]> {
    return this.prisma.course.findMany({
      where: {
        enrollments: {
          some: {
            userId,
          },
        },
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        difficulty: true,
        enrollments: {
          where: { userId },
          include: {
            progress: true,
          },
        },
        _count: {
          select: {
            modules: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async searchCourses(query: string): Promise<CourseSearchResult[]> {
    // Search by title, description, category name, or difficulty name
    return this.prisma.course.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
          { difficulty: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        difficulty: true,
        _count: {
          select: {
            enrollments: true,
            modules: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getCoursesByCategory(categoryId: string): Promise<CourseSearchResult[]> {
    return this.prisma.course.findMany({
      where: { categoryId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        difficulty: true,
        _count: {
          select: {
            enrollments: true,
            modules: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getCoursesByDifficulty(difficultyId: string): Promise<CourseSearchResult[]> {
    return this.prisma.course.findMany({
      where: { difficultyId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        difficulty: true,
        _count: {
          select: {
            enrollments: true,
            modules: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPublicCourses(category?: string, difficulty?: string) {
    const where: any = {};

    if (category) {
      where.categoryId = category;
    }

    if (difficulty) {
      where.difficultyId = difficulty;
    }

    return this.prisma.course.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        difficulty: true,
        _count: {
          select: {
            enrollments: true,
            modules: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getInstructorStats(instructorId: string) {
    // Get instructor's courses
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      include: {
        enrollments: true,
        modules: true,
        reviews: true,
      },
    });

    // Calculate total courses
    const totalCourses = courses.length;

    // Calculate total students (unique enrollments)
    const totalStudents = await this.prisma.enrollment.count({
      where: {
        course: {
          instructorId,
        },
      },
    });

    // Calculate total classes (modules)
    const totalClasses = courses.reduce((sum, course) => sum + course.modules.length, 0);

    // Calculate average rating
    const allReviews = courses.flatMap(course => course.reviews);
    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
      : 0;

    // Calculate recent enrollments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentEnrollments = await this.prisma.enrollment.count({
      where: {
        course: {
          instructorId,
        },
        enrolledAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return {
      totalCourses,
      totalStudents,
      totalClasses,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      recentEnrollments,
    };
  }
}

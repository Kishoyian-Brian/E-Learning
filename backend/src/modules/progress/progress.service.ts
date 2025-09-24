import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { MarkCompletedDto } from './dto/mark-completed.dto';
import {
  Progress,
  ProgressWithDetails,
  CourseProgress,
} from './interfaces/progress.interface';
import { ProgressValidationService } from './progress-validation.service';
import { CertificatesService } from '../certificates/certificates.service';

@Injectable()
export class ProgressService {
  constructor(
    private prisma: PrismaService,
    private validationService: ProgressValidationService,
    private certificatesService: CertificatesService,
    private mailService: MailService,
  ) {}

  async create(
    createProgressDto: CreateProgressDto,
    userId: string,
  ): Promise<Progress> {
    // Verify the enrollment belongs to the user
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        id: createProgressDto.enrollmentId,
        userId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'You can only track progress for your own enrollments',
      );
    }

    // Check if progress already exists
    const existingProgress = await this.prisma.progress.findUnique({
      where: {
        enrollmentId_moduleId: {
          enrollmentId: createProgressDto.enrollmentId,
          moduleId: createProgressDto.moduleId,
        },
      },
    });

    if (existingProgress) {
      throw new ForbiddenException(
        'Progress record already exists for this module',
      );
    }

    return this.prisma.progress.create({
      data: {
        enrollmentId: createProgressDto.enrollmentId,
        moduleId: createProgressDto.moduleId,
        completed: createProgressDto.completed || false,
        completedAt: createProgressDto.completed ? new Date() : null,
      },
    });
  }

  async findAll(): Promise<ProgressWithDetails[]> {
    return this.prisma.progress.findMany({
      include: {
        enrollment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        },
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
          },
        },
      },
    });
  }

  async findByUser(userId: string): Promise<ProgressWithDetails[]> {
    return this.prisma.progress.findMany({
      where: {
        enrollment: {
          userId,
        },
      },
      include: {
        enrollment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        },
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
          },
        },
      },
    });
  }

  async findByEnrollment(
    enrollmentId: string,
    userId: string,
  ): Promise<ProgressWithDetails[]> {
    // Verify the enrollment belongs to the user
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'You can only view progress for your own enrollments',
      );
    }

    return this.prisma.progress.findMany({
      where: {
        enrollmentId,
      },
      include: {
        enrollment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        },
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string): Promise<ProgressWithDetails> {
    const progress = await this.prisma.progress.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        },
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
          },
        },
      },
    });

    if (!progress) {
      throw new NotFoundException('Progress record not found');
    }

    // Verify the progress belongs to the user
    if (progress.enrollment.userId !== userId) {
      throw new ForbiddenException('You can only view your own progress');
    }

    return progress;
  }

  async update(
    id: string,
    updateProgressDto: UpdateProgressDto,
    userId: string,
  ): Promise<Progress> {
    const progress = await this.prisma.progress.findUnique({
      where: { id },
      include: {
        enrollment: true,
      },
    });

    if (!progress) {
      throw new NotFoundException('Progress record not found');
    }

    // Verify the progress belongs to the user
    if (progress.enrollment.userId !== userId) {
      throw new ForbiddenException('You can only update your own progress');
    }

    return this.prisma.progress.update({
      where: { id },
      data: {
        completed: updateProgressDto.completed,
        completedAt: updateProgressDto.completed ? new Date() : null,
      },
    });
  }

  async markModuleCompleted(
    enrollmentId: string,
    moduleId: string,
    userId: string,
    markCompletedDto?: MarkCompletedDto,
  ): Promise<Progress> {
    // Verify the enrollment belongs to the user (unless it's an instructor override)
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: markCompletedDto?.forceComplete ? undefined : userId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'You can only mark progress for your own enrollments',
      );
    }

    // Check if module exists
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // If it's not a force complete, validate the completion requirements
    if (!markCompletedDto?.forceComplete) {
      const validationResult =
        await this.validationService.validateModuleCompletion(
          userId,
          enrollmentId,
          moduleId,
        );

      if (!validationResult.canComplete) {
        throw new ForbiddenException(
          `Cannot complete module: ${validationResult.reason}`,
        );
      }
    }

    // Log the completion attempt for analytics
    console.log(`User ${userId} marked module ${moduleId} as completed`);

    // Upsert progress record
    return this.prisma.progress.upsert({
      where: {
        enrollmentId_moduleId: {
          enrollmentId,
          moduleId,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
        completedBy: markCompletedDto?.forceComplete ? userId : null,
        completionReason: markCompletedDto?.completionReason || null,
      },
      create: {
        enrollmentId,
        moduleId,
        completed: true,
        completedAt: new Date(),
        completedBy: markCompletedDto?.forceComplete ? userId : null,
        completionReason: markCompletedDto?.completionReason || null,
      },
    });
  }

  async markCourseCompleted(enrollmentId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, userId },
      include: { course: { include: { modules: true, quizzes: true } } }
    });
    if (!enrollment) throw new ForbiddenException('Not your enrollment');

    // Mark all modules as completed
    await Promise.all(enrollment.course.modules.map(module =>
      this.prisma.progress.upsert({
        where: { enrollmentId_moduleId: { enrollmentId, moduleId: module.id } },
        update: { completed: true, completedAt: new Date() },
        create: { enrollmentId, moduleId: module.id, completed: true, completedAt: new Date() }
      })
    ));

    // Optionally, mark all quizzes as passed for this user/enrollment
    const firstModuleId = enrollment.course.modules[0]?.id;
    await Promise.all(enrollment.course.quizzes.map(quiz =>
      this.prisma.quizCompletion.upsert({
        where: { userId_quizId: { userId, quizId: quiz.id } },
        update: { passed: true, score: 100, maxScore: 100, completedAt: new Date(), moduleId: firstModuleId },
        create: { userId, quizId: quiz.id, moduleId: firstModuleId, passed: true, score: 100, maxScore: 100, completedAt: new Date() }
      })
    ));

    return this.getCourseProgress(enrollmentId, userId);
  }

  async getCourseProgress(
    enrollmentId: string,
    userId: string,
  ): Promise<CourseProgress> {
    // Verify the enrollment belongs to the user
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId,
      },
      include: {
        course: {
          include: {
            modules: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'You can only view progress for your own enrollments',
      );
    }

    // Get all progress records for this enrollment
    const progressRecords = await this.prisma.progress.findMany({
      where: {
        enrollmentId,
      },
    });

    // Get all quizzes for this course
    const courseQuizzes = await this.prisma.quiz.findMany({
      where: {
        courseId: enrollment.courseId,
      },
      include: {
        QuizCompletion: {
          where: {
            userId,
          },
        },
      },
    });

    // Create a map of completed modules
    const completedModules = new Map(
      progressRecords.map((p) => [p.moduleId, p]),
    );

    // Calculate module progress
    const totalModules = enrollment.course.modules.length;
    const completedModulesCount = progressRecords.filter(
      (p) => p.completed,
    ).length;
    const moduleProgressPercentage =
      totalModules > 0 ? (completedModulesCount / totalModules) * 100 : 0;

    // Calculate quiz progress
    const totalQuizzes = courseQuizzes.length;
    const passedQuizzes = courseQuizzes.filter(
      (quiz) =>
        quiz.QuizCompletion.length > 0 && quiz.QuizCompletion[0].passed,
    ).length;
    const quizProgressPercentage =
      totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0;

    // Calculate overall progress (average of module and quiz progress)
    const overallProgressPercentage =
      totalModules > 0 || totalQuizzes > 0
        ? (moduleProgressPercentage + quizProgressPercentage) / 2
        : 0;

    // Check if course is completed (all modules + all quizzes passed)
    const isCourseCompleted =
      completedModulesCount === totalModules && passedQuizzes === totalQuizzes;

    // If course is completed, automatically generate certificate
    if (isCourseCompleted) {
      try {
        await this.certificatesService.generateCertificateForCourseCompletion(
          enrollmentId,
          userId,
        );
        console.log(
          `🎉 Certificate generated for course completion: ${enrollment.course.title}`,
        );

        // Send course completion notification email
        try {
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              name: true,
              email: true,
            },
          });

          if (user) {
            // Get instructor name
            const instructor = await this.prisma.user.findUnique({
              where: { id: enrollment.course.instructorId },
              select: {
                name: true,
              },
            });

            // Send admin notification
            try {
              await this.mailService.sendAdminNotificationEmail({
                subject: 'Course Completion',
                message: `A student has completed the course: ${enrollment.course.title}`,
                eventType: 'COURSE_COMPLETION',
                details: {
                  studentName: user.name,
                  studentEmail: user.email,
                  courseName: enrollment.course.title,
                  instructorName: instructor?.name || 'Course Instructor',
                  completionDate: new Date().toISOString(),
                },
              });
            } catch (adminError) {
              console.error(
                'Failed to send admin notification:',
                adminError instanceof Error ? adminError.message : 'Unknown error',
              );
            }
          }
        } catch (emailError) {
          console.error(
            'Failed to send course completion notification:',
            emailError instanceof Error ? emailError.message : 'Unknown error',
          );
        }
      } catch (error) {
        console.error(
          'Failed to generate certificate:',
          error instanceof Error ? error.message : 'Unknown error',
        );
        // Don't throw error - certificate generation failure shouldn't break progress
      }
    }

    // Get last completed module
    const lastCompleted = progressRecords
      .filter((p) => p.completed && p.completedAt)
      .sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() -
          new Date(a.completedAt!).getTime(),
      )[0];

    // Build modules array with progress
    const modules = enrollment.course.modules.map((module) => {
      const progress = completedModules.get(module.id);
      return {
        id: module.id,
        title: module.title,
        order: module.order,
        completed: progress?.completed || false,
        completedAt: progress?.completedAt,
      };
    });

    // Build quizzes array with progress
    const quizzes = courseQuizzes.map((quiz) => {
      const completion = quiz.QuizCompletion[0];
      return {
        id: quiz.id,
        title: quiz.title,
        passed: completion?.passed || false,
        score: completion?.score || null,
        maxScore: completion?.maxScore || null,
        completedAt: completion?.completedAt || null,
      };
    });

    return {
      courseId: enrollment.courseId,
      courseTitle: enrollment.course.title,
      totalModules,
      completedModules: completedModulesCount,
      moduleProgressPercentage,
      totalQuizzes,
      passedQuizzes,
      quizProgressPercentage,
      overallProgressPercentage,
      isCourseCompleted,
      lastCompletedAt: lastCompleted?.completedAt,
      modules,
      quizzes,
    };
  }

  async getUserOverallProgress(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: true,
          },
        },
        progress: true,
      },
    });

    const overallStats = enrollments.map((enrollment) => {
      const totalModules = enrollment.course.modules.length;
      const completedModules = enrollment.progress.filter(
        (p) => p.completed,
      ).length;
      const progressPercentage =
        totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

      return {
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        totalModules,
        completedModules,
        progressPercentage,
        enrolledAt: enrollment.enrolledAt,
      };
    });

    const totalCourses = enrollments.length;
    const totalModules = enrollments.reduce(
      (sum, e) => sum + e.course.modules.length,
      0,
    );
    const totalCompletedModules = enrollments.reduce(
      (sum, e) => sum + e.progress.filter((p) => p.completed).length,
      0,
    );
    const overallProgressPercentage =
      totalModules > 0 ? (totalCompletedModules / totalModules) * 100 : 0;

    return {
      totalCourses,
      totalModules,
      totalCompletedModules,
      overallProgressPercentage,
      courses: overallStats,
    };
  }
}

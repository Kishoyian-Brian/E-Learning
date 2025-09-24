import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import {
  Enrollment,
  EnrollmentWithCourse,
} from './interfaces/enrollment.interface';

@Injectable()
export class EnrollmentService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(
    createEnrollmentDto: CreateEnrollmentDto,
    userId: string,
  ): Promise<Enrollment> {
    // Validate userId
    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }

    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: createEnrollmentDto.courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if user is already enrolled
    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: createEnrollmentDto.courseId,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('User is already enrolled in this course');
    }

    // Get user details for email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId: createEnrollmentDto.courseId,
      },
    });

    // Send enrollment confirmation email
    try {
      await this.mailService.sendCourseEnrollmentEmail({
        to: user.email,
        studentName: user.name,
        courseName: course.title,
        instructorName: course.instructor.name,
      });
    } catch (error) {
      console.error(
        'Failed to send enrollment email:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      // Don't throw error, just log it
    }

    // Send admin notification
    try {
      await this.mailService.sendAdminNotificationEmail({
        subject: 'New Course Enrollment',
        message: `A new student has enrolled in ${course.title}`,
        eventType: 'ENROLLMENT',
        details: {
          studentName: user.name,
          studentEmail: user.email,
          courseName: course.title,
          instructorName: course.instructor.name,
          enrollmentDate: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error(
        'Failed to send admin notification:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    return enrollment;
  }

  async findAll(): Promise<EnrollmentWithCourse[]> {
    return this.prisma.enrollment.findMany({
      include: {
        course: {
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
                modules: true,
                enrollments: true,
              },
            },
          },
        },
      },
    });
  }

  async findByUser(userId: string): Promise<EnrollmentWithCourse[]> {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
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
                modules: true,
                enrollments: true,
              },
            },
          },
        },
      },
    });
  }

  async findByCourse(courseId: string): Promise<Enrollment[]> {
    return this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<EnrollmentWithCourse> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: {
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
                modules: true,
                enrollments: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto, userId: string): Promise<Enrollment> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Check if user owns this enrollment or is admin
    if (enrollment.userId !== userId) {
      throw new ForbiddenException('You can only update your own enrollments');
    }

    // For now, we'll just return the enrollment as-is since the schema doesn't support these fields
    // In a real implementation, you might want to add these fields to the database
    return enrollment;
  }

  async remove(id: string, userId: string): Promise<void> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Check if user owns this enrollment or is admin
    if (enrollment.userId !== userId) {
      throw new ForbiddenException('You can only remove your own enrollments');
    }

    await this.prisma.enrollment.delete({
      where: { id },
    });
  }

  async getCourseStats(courseId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
    });

    const totalEnrollments = enrollments.length;

    return {
      totalEnrollments,
      completionRate: 0, // Would need to implement progress tracking
    };
  }
} 
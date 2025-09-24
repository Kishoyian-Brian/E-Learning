import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { User, Role, Module } from '@prisma/client';

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    courseId: string,
    dto: CreateModuleDto,
    user: User,
  ): Promise<Module> {
    // Only instructor or admin can add modules (ownership check removed)
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only instructors or admins can add modules');
    }
    // Set order if not provided
    let order = dto.order;
    if (order === undefined) {
      const count = await this.prisma.module.count({ where: { courseId } });
      order = count + 1;
    }
    return this.prisma.module.create({
      data: {
        ...dto,
        description: dto.description ?? '',
        order,
        courseId,
      },
    });
  }

  async findByCourse(courseId: string): Promise<Module[]> {
    return this.prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
  }

  async update(
    moduleId: string,
    dto: UpdateModuleDto,
    user: User,
  ): Promise<Module> {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!module) throw new NotFoundException('Module not found');
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only instructors or admins can update modules');
    }
    return this.prisma.module.update({
      where: { id: moduleId },
      data: {
        ...dto,
        description: dto.description ?? module.description,
      },
    });
  }

  async remove(moduleId: string, user: User): Promise<void> {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!module) throw new NotFoundException('Module not found');
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only instructors or admins can delete modules');
    }
    await this.prisma.module.delete({ where: { id: moduleId } });
  }

  async getMaterialsForModule(moduleId: string) {
    // Get the module to find its courseId
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true }
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Get regular materials
    const materials = await this.prisma.material.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    });

    // Get quizzes for this course
    const quizzes = await this.prisma.quiz.findMany({
      where: { courseId: module.courseId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Convert quizzes to material format
    const quizMaterials = quizzes.map((quiz, index) => ({
      id: `quiz-${quiz.id}`, // Unique ID for quiz materials
      type: 'QUIZ',
      url: `/quizzes/${quiz.id}`, // URL to take the quiz
      moduleId: moduleId,
      visible: true,
      createdAt: quiz.createdAt,
      description: `Quiz: ${quiz.title}`,
      order: materials.length + index + 1, // Add quizzes after regular materials
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

    // Combine regular materials and quiz materials
    return [...materials, ...quizMaterials];
  }

  async getModuleById(id: string) {
    return this.prisma.module.findUnique({ where: { id } });
  }
}

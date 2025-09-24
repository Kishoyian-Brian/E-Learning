import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizAttemptDto, SubmitQuizAttemptDto } from './dto/quiz-attempt.dto';
import {
  QuizWithQuestions,
  QuizAttempt,
  QuizResult,
} from './interfaces/quiz.interface';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async create(createQuizDto: CreateQuizDto, userId: string): Promise<QuizWithQuestions> {
    // Verify the user is an instructor or admin for this course
    const course = await this.prisma.course.findFirst({
      where: {
        id: createQuizDto.courseId,
        instructorId: userId,
      },
    });

    if (!course) {
      throw new ForbiddenException('You can only create quizzes for your own courses');
    }

    const quiz = await this.prisma.quiz.create({
      data: {
        title: createQuizDto.title,
        courseId: createQuizDto.courseId,
        timeLimit: createQuizDto.timeLimit,
        questions: {
          create: createQuizDto.questions.map((question) => ({
            text: question.text,
            type: question.type,
            options: question.options,
            answer: question.answer,
            order: question.order,
          })),
        },
      },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return quiz;
  }

  async findAll(): Promise<QuizWithQuestions[]> {
    return this.prisma.quiz.findMany({
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async findByCourse(courseId: string): Promise<QuizWithQuestions[]> {
    return this.prisma.quiz.findMany({
      where: { courseId },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<QuizWithQuestions> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto, userId: string): Promise<QuizWithQuestions> {
    // Verify the user is an instructor or admin for this course
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.course.instructorId !== userId) {
      throw new ForbiddenException('You can only update quizzes for your own courses');
    }

    const updatedQuiz = await this.prisma.quiz.update({
      where: { id },
      data: {
        title: updateQuizDto.title,
        timeLimit: updateQuizDto.timeLimit,
        questions: updateQuizDto.questions
          ? {
              deleteMany: {},
              create: updateQuizDto.questions.map((question) => ({
                text: question.text,
                type: question.type,
                options: question.options,
                answer: question.answer,
                order: question.order,
              })),
            }
          : undefined,
      },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return updatedQuiz;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Verify the user is an instructor or admin for this course
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.course.instructorId !== userId) {
      throw new ForbiddenException('You can only delete quizzes for your own courses');
    }

    await this.prisma.quiz.delete({
      where: { id },
    });
  }

  async startAttempt(quizId: string, userId: string): Promise<QuizAttempt> {
    // Check if quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check if user is enrolled in the course
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        courseId: quiz.courseId,
        userId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You must be enrolled in the course to take this quiz');
    }

    // Check if there's already an active attempt
    const activeAttempt = await this.prisma.quizAttempt.findFirst({
      where: {
        quizId,
        userId,
        completedAt: null,
      },
    });

    if (activeAttempt) {
      throw new BadRequestException('You already have an active attempt for this quiz');
    }

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        startedAt: new Date(),
      },
      include: {
        answers: true,
      },
    });

    return attempt;
  }

  async submitAttempt(
    attemptId: string,
    submitAttemptDto: SubmitQuizAttemptDto,
    userId: string,
  ): Promise<QuizResult> {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You can only submit your own quiz attempts');
    }

    if (attempt.completedAt) {
      throw new BadRequestException('This attempt has already been completed');
    }

    // Save the answers
    const savedAnswers = await Promise.all(
      submitAttemptDto.answers.map((answer) =>
        this.prisma.answer.create({
          data: {
            quizAttemptId: attemptId,
            questionId: answer.questionId,
            response: answer.response,
          },
        }),
      ),
    );

    // Get the updated attempt with all answers
    const updatedAttempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
        answers: true,
      },
    });

    if (!updatedAttempt) {
      throw new NotFoundException('Quiz attempt not found after saving answers');
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = updatedAttempt.quiz.questions.length;

    for (const answer of updatedAttempt.answers) {
      const question = updatedAttempt.quiz.questions.find((q) => q.id === answer.questionId);
      if (question && answer.response === question.answer) {
        correctAnswers++;
      }
    }

    const score = correctAnswers;
    const maxScore = totalQuestions;
    const percentage = totalQuestions > 0 ? (score / maxScore) * 100 : 0;
    // Always use 90 as the passing score
    const passingScore = 90;
    const passed = percentage >= passingScore;

    // Update attempt with results
    await this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt: new Date(),
        score,
      },
    });

    return {
      quizId: attempt.quizId,
      score,
      maxScore,
      passed,
      percentage,
    };
  }

  async getAttempts(userId: string): Promise<QuizAttempt[]> {
    return this.prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: true,
        answers: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }

  async getAttemptById(attemptId: string, userId: string): Promise<QuizAttempt> {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You can only view your own quiz attempts');
    }

    return attempt;
  }
} 
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizAttemptDto, SubmitQuizAttemptDto } from './dto/quiz-attempt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  create(@Body() createQuizDto: CreateQuizDto, @CurrentUser() user: JwtPayload) {
    return this.quizService.create(createQuizDto, user.sub);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.quizService.findAll();
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.quizService.findByCourse(courseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.quizService.update(id, updateQuizDto, user.sub);
  }

  @Delete(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.quizService.remove(id, user.sub);
  }

  // Quiz Attempts
  @Post(':quizId/start')
  startAttempt(@Param('quizId') quizId: string, @CurrentUser() user: JwtPayload) {
    return this.quizService.startAttempt(quizId, user.sub);
  }

  @Post('attempts/:attemptId/submit')
  submitAttempt(
    @Param('attemptId') attemptId: string,
    @Body() submitAttemptDto: SubmitQuizAttemptDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.quizService.submitAttempt(attemptId, submitAttemptDto, user.sub);
  }

  @Get('attempts/my')
  getMyAttempts(@CurrentUser() user: JwtPayload) {
    return this.quizService.getAttempts(user.sub);
  }

  @Get('attempts/:attemptId')
  getAttemptById(@Param('attemptId') attemptId: string, @CurrentUser() user: JwtPayload) {
    return this.quizService.getAttemptById(attemptId, user.sub);
  }
} 
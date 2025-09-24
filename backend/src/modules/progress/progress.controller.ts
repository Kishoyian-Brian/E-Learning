import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressValidationService } from './progress-validation.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { MarkCompletedDto } from './dto/mark-completed.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
    private readonly validationService: ProgressValidationService,
  ) {}

  @Post()
  create(@Body() createProgressDto: CreateProgressDto, @CurrentUser() user: JwtPayload) {
    return this.progressService.create(createProgressDto, user.sub);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.progressService.findAll();
  }

  @Get('my-progress')
  findMyProgress(@CurrentUser() user: JwtPayload) {
    return this.progressService.findByUser(user.sub);
  }

  @Get('enrollment/:id')
  findByEnrollment(@Param('id') enrollmentId: string, @CurrentUser() user: JwtPayload) {
    return this.progressService.findByEnrollment(enrollmentId, user.sub);
  }

  @Get('course/:enrollmentId')
  getCourseProgress(@Param('enrollmentId') enrollmentId: string, @CurrentUser() user: JwtPayload) {
    return this.progressService.getCourseProgress(enrollmentId, user.sub);
  }

  @Get('overall')
  getUserOverallProgress(@CurrentUser() user: JwtPayload) {
    return this.progressService.getUserOverallProgress(user.sub);
  }

  @Get('settings')
  getProgressSettings() {
    // In the future, this could be dynamic or fetched from config/db
    return {
      minVideoWatchPercentage: 100
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.progressService.findOne(id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.progressService.update(id, updateProgressDto, user.sub);
  }

  @Post('mark-completed/:enrollmentId/:moduleId')
  markModuleCompleted(
    @Param('enrollmentId') enrollmentId: string,
    @Param('moduleId') moduleId: string,
    @Body() markCompletedDto: MarkCompletedDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.progressService.markModuleCompleted(enrollmentId, moduleId, user.sub, markCompletedDto);
  }

  @Post('mark-course-completed/:enrollmentId')
  markCourseCompleted(
    @Param('enrollmentId') enrollmentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.progressService.markCourseCompleted(enrollmentId, user.sub);
  }

  // New tracking endpoints
  @Post('track-activity')
  trackUserActivity(
    @Body() activityData: {
      moduleId: string;
      materialId?: string;
      activityType: string;
      duration?: number;
      progress?: number;
      metadata?: any;
    },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.validationService.trackUserActivity(
      user.sub,
      activityData.moduleId,
      activityData.materialId || null,
      activityData.activityType,
      activityData.duration,
      activityData.progress,
      activityData.metadata,
    );
  }

  @Post('video-progress')
  updateVideoProgress(
    @Body() videoData: {
      materialId: string;
      moduleId: string;
      currentTime: number;
      duration: number;
      watchedPercentage: number;
    },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.validationService.updateVideoProgress(
      user.sub,
      videoData.materialId,
      videoData.moduleId,
      videoData.currentTime,
      videoData.duration,
      videoData.watchedPercentage,
    );
  }

  @Post('quiz-completion')
  recordQuizCompletion(
    @Body() quizData: {
      quizId: string;
      moduleId: string;
      score: number;
      maxScore: number;
      passed: boolean;
    },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.validationService.recordQuizCompletion(
      user.sub,
      quizData.quizId,
      quizData.moduleId,
      quizData.score,
      quizData.maxScore,
      quizData.passed,
    );
  }

  @Get('module/:moduleId/stats')
  getModuleAccessStats(@Param('moduleId') moduleId: string, @CurrentUser() user: JwtPayload) {
    return this.validationService.getModuleAccessStats(user.sub, moduleId);
  }

  @Post('module/:moduleId/requirements')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  setModuleRequirements(
    @Param('moduleId') moduleId: string,
    @Body() requirements: {
      minTimeSpent?: number;
      requireAllMaterials?: boolean;
      requireQuizCompletion?: boolean;
      requireVideoCompletion?: boolean;
      minVideoWatchPercentage?: number;
    },
  ) {
    return this.validationService.setModuleRequirements(moduleId, requirements);
  }

  @Post('instructor-override/:enrollmentId/:moduleId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  instructorOverride(
    @Param('enrollmentId') enrollmentId: string,
    @Param('moduleId') moduleId: string,
    @Body() overrideData: {
      reason: string;
      userId: string;
    },
    @CurrentUser() user: JwtPayload,
  ) {
    // Verify the instructor has access to this course
    return this.progressService.markModuleCompleted(
      enrollmentId,
      moduleId,
      overrideData.userId,
      {
        forceComplete: true,
        completionReason: `Instructor override by ${user.sub}: ${overrideData.reason}`,
      },
    );
  }

  @Get('validation/:enrollmentId/:moduleId')
  validateModuleCompletion(
    @Param('enrollmentId') enrollmentId: string,
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.validationService.validateModuleCompletion(
      user.sub,
      enrollmentId,
      moduleId,
    );
  }
} 
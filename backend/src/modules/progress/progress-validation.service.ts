import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

export interface ValidationResult {
  isValid: boolean;
  canComplete: boolean;
  reason?: string;
  details?: {
    timeSpent: number;
    requiredTime: number;
    materialsAccessed: number;
    totalMaterials: number;
    videosCompleted: number;
    totalVideos: number;
    quizzesPassed: number;
    totalQuizzes: number;
    overallProgress: number;
  };
}

@Injectable()
export class ProgressValidationService {
  constructor(private prisma: PrismaService) {}

  async validateModuleCompletion(
    userId: string,
    enrollmentId: string,
    moduleId: string,
    skipValidation = false,
    forceComplete = false,
  ): Promise<ValidationResult> {
    if (skipValidation || forceComplete) {
      return {
        isValid: true,
        canComplete: true,
        reason: forceComplete ? 'Instructor override' : 'Validation skipped',
      };
    }

    // Get module requirements
    const requirements = await this.prisma.moduleRequirements.findUnique({
      where: { moduleId },
    });

    // Get module materials
    const materials = await this.prisma.material.findMany({
      where: { moduleId },
      include: { module: true },
    });

    // Get user activity for this module
    const userActivity = await this.prisma.userActivity.findMany({
      where: { userId, moduleId },
    });

    // Get video progress
    const videoProgress = await this.prisma.videoProgress.findMany({
      where: { userId, moduleId },
    });

    // Get quiz completions
    const quizCompletions = await this.prisma.quizCompletion.findMany({
      where: { userId, moduleId },
    });

    // Calculate total time spent
    const totalTimeSpent = userActivity.reduce((total, activity) => {
      if (activity.duration) {
        return total + activity.duration;
      }
      return total;
    }, 0);

    // Calculate materials accessed
    const materialsAccessed = new Set(
      userActivity
        .filter((activity: any) => activity.materialId)
        .map((activity: any) => activity.materialId),
    ).size;

    // Calculate video completion
    const videosCompleted = videoProgress.filter(
      (vp: any) => vp.isCompleted,
    ).length;
    const totalVideos = materials.filter((m) => m.type === 'VIDEO').length;

    // Calculate quiz completion
    const quizzesPassed = quizCompletions.filter((qc: any) => qc.passed).length;
    const totalQuizzes = await this.prisma.quiz.count({
      where: { courseId: materials[0]?.module?.courseId },
    });

    // Validation checks
    const validationChecks = [];

    // Time-based validation
    if (requirements?.minTimeSpent && requirements.minTimeSpent > 0) {
      if (totalTimeSpent < requirements.minTimeSpent) {
        validationChecks.push({
          passed: false,
          reason: `Minimum time not met. Required: ${requirements.minTimeSpent}s, Spent: ${totalTimeSpent}s`,
        });
      } else {
        validationChecks.push({ passed: true, reason: 'Time requirement met' });
      }
    }

    // Materials access validation
    if (requirements?.requireAllMaterials && materials.length > 0) {
      if (materialsAccessed < materials.length) {
        validationChecks.push({
          passed: false,
          reason: `Not all materials accessed. Required: ${materials.length}, Accessed: ${materialsAccessed}`,
        });
      } else {
        validationChecks.push({
          passed: true,
          reason: 'All materials accessed',
        });
      }
    }

    // Video completion validation
    if (requirements?.requireVideoCompletion && totalVideos > 0) {
      if (videosCompleted < totalVideos) {
        validationChecks.push({
          passed: false,
          reason: `Not all videos completed. Required: ${totalVideos}, Completed: ${videosCompleted}`,
        });
      } else {
        validationChecks.push({ passed: true, reason: 'All videos completed' });
      }
    }

    // Quiz completion validation
    if (requirements?.requireQuizCompletion && totalQuizzes > 0) {
      if (quizzesPassed < totalQuizzes) {
        validationChecks.push({
          passed: false,
          reason: `Not all quizzes passed. Required: ${totalQuizzes}, Passed: ${quizzesPassed}`,
        });
      } else {
        validationChecks.push({ passed: true, reason: 'All quizzes passed' });
      }
    }

    // Overall validation
    const failedChecks = validationChecks.filter((check: any) => !check.passed);
    const isValid = failedChecks.length === 0;

    return {
      isValid,
      canComplete: isValid,
      reason: isValid
        ? 'All requirements met'
        : failedChecks.map((check: any) => check.reason).join('; '),
      details: {
        timeSpent: totalTimeSpent,
        requiredTime: requirements?.minTimeSpent || 0,
        materialsAccessed,
        totalMaterials: materials.length,
        videosCompleted,
        totalVideos,
        quizzesPassed,
        totalQuizzes,
        overallProgress: this.calculateOverallProgress(
          totalTimeSpent,
          requirements?.minTimeSpent || 0,
          materialsAccessed,
          materials.length,
          videosCompleted,
          totalVideos,
          quizzesPassed,
          totalQuizzes,
        ),
      },
    };
  }

  private calculateOverallProgress(
    timeSpent: number,
    requiredTime: number,
    materialsAccessed: number,
    totalMaterials: number,
    videosCompleted: number,
    totalVideos: number,
    quizzesPassed: number,
    totalQuizzes: number,
  ): number {
    const checks = [];

    if (requiredTime > 0) {
      checks.push(Math.min((timeSpent / requiredTime) * 100, 100));
    }

    if (totalMaterials > 0) {
      checks.push((materialsAccessed / totalMaterials) * 100);
    }

    if (totalVideos > 0) {
      checks.push((videosCompleted / totalVideos) * 100);
    }

    if (totalQuizzes > 0) {
      checks.push((quizzesPassed / totalQuizzes) * 100);
    }

    return checks.length > 0
      ? checks.reduce((sum: number, val: number) => sum + val, 0) /
          checks.length
      : 0;
  }

  async trackUserActivity(
    userId: string,
    moduleId: string,
    materialId: string | null,
    activityType: string,
    duration?: number,
    progress?: number,
    metadata?: any,
  ) {
    // For quiz materials (which have IDs like "quiz-{quizId}"), 
    // we don't store them in the Material table, so we can't reference them
    // in UserActivity. We'll set materialId to null for quiz activities.
    const actualMaterialId = materialId && materialId.startsWith('quiz-') ? null : materialId;
    
    return this.prisma.userActivity.create({
      data: {
        userId,
        moduleId,
        materialId: actualMaterialId,
        activityType,
        duration,
        progress,
        metadata: {
          ...metadata,
          originalMaterialId: materialId, // Store the original ID in metadata for reference
        },
      },
    });
  }

  async updateVideoProgress(
    userId: string,
    materialId: string,
    moduleId: string,
    currentTime: number,
    duration: number,
    watchedPercentage: number,
  ) {
    const isCompleted = watchedPercentage >= 100; // 100% threshold

    return this.prisma.videoProgress.upsert({
      where: {
        userId_materialId: { userId, materialId },
      },
      update: {
        currentTime,
        duration,
        watchedPercentage,
        isCompleted,
        lastWatchedAt: new Date(),
      },
      create: {
        userId,
        materialId,
        moduleId,
        currentTime,
        duration,
        watchedPercentage,
        isCompleted,
      },
    });
  }

  async recordQuizCompletion(
    userId: string,
    quizId: string,
    moduleId: string,
    score: number,
    maxScore: number,
    passed: boolean,
  ) {
    const quizCompletion = await this.prisma.quizCompletion.upsert({
      where: {
        userId_quizId: { userId, quizId },
      },
      update: {
        score,
        maxScore,
        passed,
        attempts: { increment: 1 },
        completedAt: new Date(),
        moduleId,
      },
      create: {
        userId,
        quizId,
        moduleId,
        score,
        maxScore,
        passed,
        completedAt: new Date(),
      },
    });

    // If passed, also mark the module as completed in Progress
    if (passed) {
      // Find the user's enrollment for this course
      const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
      if (quiz) {
        const enrollment = await this.prisma.enrollment.findFirst({
          where: { userId, courseId: quiz.courseId },
        });
        if (enrollment) {
          await this.prisma.progress.upsert({
            where: { enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId } },
            update: { completed: true, completedAt: new Date() },
            create: { enrollmentId: enrollment.id, moduleId, completed: true, completedAt: new Date() },
          });
        }
      }
    }

    return quizCompletion;
  }

  async getModuleAccessStats(userId: string, moduleId: string) {
    const [userActivity, videoProgress, quizCompletions, requirements] =
      await Promise.all([
        this.prisma.userActivity.findMany({
          where: { userId, moduleId },
        }),
        this.prisma.videoProgress.findMany({
          where: { userId, moduleId },
        }),
        this.prisma.quizCompletion.findMany({
          where: { userId, moduleId },
        }),
        this.prisma.moduleRequirements.findUnique({
          where: { moduleId },
        }),
      ]);

    const totalTimeSpent = userActivity.reduce(
      (total: number, activity: any) => {
        return total + (activity.duration || 0);
      },
      0,
    );

    const materialsAccessed = new Set(
      userActivity
        .filter((activity: any) => activity.materialId || (activity.metadata?.originalMaterialId && activity.metadata.originalMaterialId.startsWith('quiz-')))
        .map((activity: any) => activity.materialId || activity.metadata?.originalMaterialId),
    ).size;

    const videosCompleted = videoProgress.filter(
      (vp: any) => vp.isCompleted,
    ).length;
    const quizzesPassed = quizCompletions.filter((qc: any) => qc.passed).length;

    return {
      timeSpent: totalTimeSpent,
      materialsAccessed,
      videosCompleted,
      quizzesPassed,
      requirements: requirements || {
        minTimeSpent: 0,
        requireAllMaterials: true,
        requireQuizCompletion: false,
        requireVideoCompletion: false,
        minVideoWatchPercentage: 80,
      },
    };
  }

  async setModuleRequirements(
    moduleId: string,
    requirements: {
      minTimeSpent?: number;
      requireAllMaterials?: boolean;
      requireQuizCompletion?: boolean;
      requireVideoCompletion?: boolean;
      minVideoWatchPercentage?: number;
    },
  ) {
    return this.prisma.moduleRequirements.upsert({
      where: { moduleId },
      update: requirements,
      create: {
        moduleId,
        ...requirements,
      },
    });
  }
}

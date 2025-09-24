-- Add access tracking tables for progress validation

-- User activity tracking
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "materialId" TEXT,
    "activityType" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER, -- in seconds
    "progress" INTEGER DEFAULT 0, -- percentage (0-100)
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- Video watch progress
CREATE TABLE "VideoProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "currentTime" INTEGER DEFAULT 0, -- seconds
    "duration" INTEGER DEFAULT 0, -- total video duration
    "watchedPercentage" INTEGER DEFAULT 0,
    "isCompleted" BOOLEAN DEFAULT false,
    "lastWatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoProgress_pkey" PRIMARY KEY ("id")
);

-- Quiz completion tracking
CREATE TABLE "QuizCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "score" INTEGER,
    "maxScore" INTEGER,
    "passed" BOOLEAN DEFAULT false,
    "attempts" INTEGER DEFAULT 1,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizCompletion_pkey" PRIMARY KEY ("id")
);

-- Module completion requirements
CREATE TABLE "ModuleRequirements" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "minTimeSpent" INTEGER DEFAULT 0, -- minimum seconds required
    "requireAllMaterials" BOOLEAN DEFAULT true,
    "requireQuizCompletion" BOOLEAN DEFAULT false,
    "requireVideoCompletion" BOOLEAN DEFAULT false,
    "minVideoWatchPercentage" INTEGER DEFAULT 80,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleRequirements_pkey" PRIMARY KEY ("id")
);

-- Indexes for performance
CREATE INDEX "UserActivity_userId_idx" ON "UserActivity"("userId");
CREATE INDEX "UserActivity_moduleId_idx" ON "UserActivity"("moduleId");
CREATE INDEX "UserActivity_activityType_idx" ON "UserActivity"("activityType");
CREATE INDEX "VideoProgress_userId_idx" ON "VideoProgress"("userId");
CREATE INDEX "VideoProgress_materialId_idx" ON "VideoProgress"("materialId");
CREATE INDEX "QuizCompletion_userId_idx" ON "QuizCompletion"("userId");
CREATE INDEX "QuizCompletion_moduleId_idx" ON "QuizCompletion"("moduleId");
CREATE INDEX "ModuleRequirements_moduleId_idx" ON "ModuleRequirements"("moduleId");

-- Foreign key constraints
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VideoProgress" ADD CONSTRAINT "VideoProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VideoProgress" ADD CONSTRAINT "VideoProgress_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VideoProgress" ADD CONSTRAINT "VideoProgress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizCompletion" ADD CONSTRAINT "QuizCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizCompletion" ADD CONSTRAINT "QuizCompletion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizCompletion" ADD CONSTRAINT "QuizCompletion_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ModuleRequirements" ADD CONSTRAINT "ModuleRequirements_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE; 
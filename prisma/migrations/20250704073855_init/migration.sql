-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('HR', 'MANAGER', 'ADMIN', 'INTERVIEWER');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED', 'DRAFT');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('ACTIVE', 'REJECTED', 'HIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "HiringStage" AS ENUM ('OMOED', 'SCREENING', 'TECHNICAL_TEST', 'FINAL_INTERVIEW', 'HIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'HR',
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE',
    "level" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "workType" TEXT NOT NULL,
    "salary" TEXT,
    "location" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "visibleRequirements" TEXT[],
    "invisibleRequirements" TEXT[],
    "responsibilities" TEXT[],
    "applicantCount" INTEGER NOT NULL DEFAULT 0,
    "latestUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "hrUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "avatarUrl" TEXT,
    "personalInfo" JSONB NOT NULL,
    "socialLinks" JSONB,
    "overview" TEXT,
    "resumeUrl" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attachments" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "currentStage" "HiringStage" NOT NULL DEFAULT 'OMOED',
    "status" "CandidateStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rejectedAt" TIMESTAMP(3),
    "hiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_jobs" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_experiences" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "logoUrl" TEXT,
    "title" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "description" TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedDetail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedDetail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedDetail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "awards" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "description" TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedDetail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "description" TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedDetail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hiring_progress" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "stage" "HiringStage" NOT NULL,
    "date" TEXT,
    "status" "StageStatus" NOT NULL DEFAULT 'PENDING',
    "nextStage" BOOLEAN NOT NULL DEFAULT false,
    "score" DOUBLE PRECISION,
    "percentileRanking" TEXT,
    "feedback" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "hrNotes" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "participants" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hiring_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_sessions" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "hrUserId" TEXT NOT NULL,
    "jobId" TEXT,
    "stage" "HiringStage" NOT NULL,
    "dateTime" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "participants" JSONB[],
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "meetingLink" TEXT,
    "meetingId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_analyses" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "duration" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "communicationScore" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION,
    "clarityScore" DOUBLE PRECISION,
    "feedback" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "telegramMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audio_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_tests" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "questions" JSONB[],
    "answers" JSONB[],
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "percentageScore" DOUBLE PRECISION NOT NULL,
    "feedback" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "status" "TestStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "timeLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technical_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_notes" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "hrUserId" TEXT NOT NULL,
    "stage" "HiringStage" NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT,
    "hrUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "relatedStage" "HiringStage",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smars_config" (
    "id" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "thresholds" JSONB NOT NULL,
    "aiModel" TEXT NOT NULL DEFAULT 'gemini-pro',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "smars_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_bots" (
    "id" TEXT NOT NULL,
    "botToken" TEXT NOT NULL,
    "chatId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "webhookUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_bots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_jobs_candidateId_jobId_key" ON "candidate_jobs"("candidateId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "hiring_progress_candidateId_stage_key" ON "hiring_progress"("candidateId", "stage");

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_hrUserId_fkey" FOREIGN KEY ("hrUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_jobs" ADD CONSTRAINT "candidate_jobs_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_jobs" ADD CONSTRAINT "candidate_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education" ADD CONSTRAINT "education_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "awards" ADD CONSTRAINT "awards_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hiring_progress" ADD CONSTRAINT "hiring_progress_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_sessions" ADD CONSTRAINT "scheduled_sessions_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_sessions" ADD CONSTRAINT "scheduled_sessions_hrUserId_fkey" FOREIGN KEY ("hrUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_analyses" ADD CONSTRAINT "audio_analyses_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_tests" ADD CONSTRAINT "technical_tests_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_notes" ADD CONSTRAINT "interview_notes_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_notes" ADD CONSTRAINT "interview_notes_hrUserId_fkey" FOREIGN KEY ("hrUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_hrUserId_fkey" FOREIGN KEY ("hrUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

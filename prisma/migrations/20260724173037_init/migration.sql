-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('INCOMPLETE', 'DRAFT', 'READY_TO_PUBLISH', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "githubUsername" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "profileStatus" "ProfileStatus" NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "isLeetcodeVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "currentRole" TEXT,
    "currentCompany" TEXT,
    "yearsExperience" INTEGER,
    "college" TEXT,
    "graduationYear" INTEGER,
    "techStack" JSONB,
    "linkedinUrl" TEXT,
    "portfolioUrl" TEXT,
    "resumeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "githubRepoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stars" INTEGER NOT NULL,
    "forks" INTEGER NOT NULL,
    "primaryLanguage" TEXT,
    "topics" JSONB,
    "githubUrl" TEXT NOT NULL,
    "homepageUrl" TEXT,
    "isFork" BOOLEAN NOT NULL,
    "isArchived" BOOLEAN NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER,
    "customTitle" TEXT,
    "customDescription" TEXT,
    "liveDemoUrl" TEXT,
    "projectSummary" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubCache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "followers" INTEGER,
    "following" INTEGER,
    "publicRepoCount" INTEGER,
    "contributions365" INTEGER,
    "longestStreak" INTEGER,
    "activeWeeks" INTEGER,
    "ossPrsMerged" INTEGER,
    "starsEarned" INTEGER,
    "languageDistribution" JSONB,
    "contributionSeries" JSONB,
    "lastSyncedAt" TIMESTAMP(3),
    "cacheExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeetCodeCache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "contestRating" INTEGER,
    "globalRanking" INTEGER,
    "percentile" DOUBLE PRECISION,
    "problemsSolved" INTEGER,
    "easySolved" INTEGER,
    "mediumSolved" INTEGER,
    "hardSolved" INTEGER,
    "contestsParticipated" INTEGER,
    "ratingHistory" JSONB,
    "submissionCalendar" JSONB,
    "verificationToken" TEXT,
    "verificationTokenExpiresAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "cacheExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeetCodeCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profylScore" INTEGER,
    "tier" "Tier",
    "githubScore" INTEGER,
    "projectsScore" INTEGER,
    "leetcodeScore" INTEGER,
    "consistencyScore" INTEGER,
    "radar" JSONB,
    "signalBreakdown" JSONB,
    "profylPercentile" DOUBLE PRECISION,
    "computedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInsights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aiSignal" TEXT,
    "aiSummary" TEXT,
    "strengthChips" JSONB,
    "sourceHash" TEXT,
    "modelVersion" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIInsights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubUsername_key" ON "User"("githubUsername");

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- CreateIndex
CREATE INDEX "User_githubUsername_idx" ON "User"("githubUsername");

-- CreateIndex
CREATE INDEX "User_slug_idx" ON "User"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_githubRepoId_key" ON "Repository"("githubRepoId");

-- CreateIndex
CREATE INDEX "Repository_userId_idx" ON "Repository"("userId");

-- CreateIndex
CREATE INDEX "Repository_userId_isFeatured_idx" ON "Repository"("userId", "isFeatured");

-- CreateIndex
CREATE INDEX "Repository_userId_displayOrder_idx" ON "Repository"("userId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubCache_userId_key" ON "GitHubCache"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LeetCodeCache_userId_key" ON "LeetCodeCache"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LeetCodeCache_username_key" ON "LeetCodeCache"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_userId_key" ON "Analytics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AIInsights_userId_key" ON "AIInsights"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubCache" ADD CONSTRAINT "GitHubCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeetCodeCache" ADD CONSTRAINT "LeetCodeCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInsights" ADD CONSTRAINT "AIInsights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

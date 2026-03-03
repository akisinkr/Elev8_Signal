-- CreateEnum
CREATE TYPE "OnboardingState" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PROPOSED', 'PRESENTED', 'ACCEPTED', 'ACTIVE', 'COMPLETED', 'DECLINED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'VOICE_NOTE');

-- CreateEnum
CREATE TYPE "FeedbackRating" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "SignalStatus" AS ENUM ('DRAFT', 'LIVE', 'CLOSED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "SignalCategory" AS ENUM ('AI_STRATEGY', 'KOREA_TACTICAL', 'LEADERSHIP', 'WILDCARD', 'SYNTHESIS');

-- CreateEnum
CREATE TYPE "SignalAnswer" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "bio" TEXT,
    "headline" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "linkedinUrl" TEXT,
    "superpowers" TEXT[],
    "challenges" TEXT[],
    "onboardingState" "OnboardingState" NOT NULL DEFAULT 'NOT_STARTED',
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "member1Id" TEXT NOT NULL,
    "member2Id" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PROPOSED',
    "curatorNote" TEXT,
    "matchedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "voiceNoteUrl" TEXT,
    "matchId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "rating" "FeedbackRating" NOT NULL,
    "comment" TEXT,
    "matchId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalQuestion" (
    "id" TEXT NOT NULL,
    "signalNumber" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "category" "SignalCategory" NOT NULL DEFAULT 'WILDCARD',
    "status" "SignalStatus" NOT NULL DEFAULT 'DRAFT',
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "optionD" TEXT NOT NULL,
    "optionE" TEXT NOT NULL,
    "headlineInsight" TEXT,
    "voteDeadline" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignalQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalVote" (
    "id" TEXT NOT NULL,
    "answer" "SignalAnswer" NOT NULL,
    "why" TEXT,
    "questionId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignalVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_clerkId_key" ON "Member"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_clerkId_idx" ON "Member"("clerkId");

-- CreateIndex
CREATE INDEX "Match_member1Id_idx" ON "Match"("member1Id");

-- CreateIndex
CREATE INDEX "Match_member2Id_idx" ON "Match"("member2Id");

-- CreateIndex
CREATE INDEX "Message_matchId_idx" ON "Message"("matchId");

-- CreateIndex
CREATE INDEX "Feedback_matchId_idx" ON "Feedback"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_matchId_memberId_key" ON "Feedback"("matchId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "SignalQuestion_signalNumber_key" ON "SignalQuestion"("signalNumber");

-- CreateIndex
CREATE INDEX "SignalQuestion_status_idx" ON "SignalQuestion"("status");

-- CreateIndex
CREATE INDEX "SignalQuestion_signalNumber_idx" ON "SignalQuestion"("signalNumber");

-- CreateIndex
CREATE INDEX "SignalVote_questionId_idx" ON "SignalVote"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "SignalVote_questionId_memberId_key" ON "SignalVote"("questionId", "memberId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_member1Id_fkey" FOREIGN KEY ("member1Id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_member2Id_fkey" FOREIGN KEY ("member2Id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalVote" ADD CONSTRAINT "SignalVote_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SignalQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalVote" ADD CONSTRAINT "SignalVote_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

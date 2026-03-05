-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "SignalSuggestion" (
    "id" TEXT NOT NULL,
    "rawQuestion" TEXT NOT NULL,
    "context" TEXT,
    "polishedQuestion" TEXT,
    "suggestedOptions" TEXT,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignalSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SignalSuggestion_status_idx" ON "SignalSuggestion"("status");

-- CreateIndex
CREATE INDEX "SignalSuggestion_memberId_idx" ON "SignalSuggestion"("memberId");

-- AddForeignKey
ALTER TABLE "SignalSuggestion" ADD CONSTRAINT "SignalSuggestion_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable (add missing column to SignalVote)
ALTER TABLE "SignalVote" ADD COLUMN IF NOT EXISTS "resultEmailSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "monthlyPoints" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN     "monthlyPeriod" TEXT;
ALTER TABLE "User" ADD COLUMN     "lastStreakMilestone" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "feedbackRequest" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN     "feedbackFocus" TEXT;
ALTER TABLE "Post" ADD COLUMN     "challengeId" TEXT;

-- CreateIndex
CREATE INDEX "Post_challengeId_idx" ON "Post"("challengeId");

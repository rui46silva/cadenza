-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;

-- Backfill score from existing votes (UP = +1, DOWN = -1)
UPDATE "Post" p SET "score" = COALESCE((
  SELECT SUM(CASE WHEN v."value" = 'UP' THEN 1 ELSE -1 END)
  FROM "PostVote" v WHERE v."postId" = p."id"
), 0);

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
CREATE INDEX "Post_score_idx" ON "Post"("score");

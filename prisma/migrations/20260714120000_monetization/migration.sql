-- Monetização: subscrição Premium, perfis em destaque e posts patrocinados.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isPremium" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "premiumUntil" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "featuredUntil" TIMESTAMP(3);

ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "sponsored" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "sponsorName" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "sponsorUrl" TEXT;

CREATE INDEX IF NOT EXISTS "Post_sponsored_idx" ON "Post"("sponsored");

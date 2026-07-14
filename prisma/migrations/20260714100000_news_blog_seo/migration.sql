-- Campos de blog/SEO para as notícias.
ALTER TABLE "NewsArticle" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "NewsArticle" ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE "NewsArticle" ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;

-- Preenche um slug inicial a partir do título para notícias já existentes.
UPDATE "NewsArticle"
SET "slug" = trim(both '-' from regexp_replace(lower("title"), '[^a-z0-9]+', '-', 'g')) || '-' || substr("id", 1, 6)
WHERE "slug" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "NewsArticle_slug_key" ON "NewsArticle"("slug");
CREATE INDEX IF NOT EXISTS "NewsArticle_publishedAt_idx" ON "NewsArticle"("publishedAt");

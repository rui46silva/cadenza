-- Slug SEO-friendly (baseado no título) para os posts.
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Preenche um slug inicial a partir do título + sufixo do id (garante unicidade).
UPDATE "Post"
SET "slug" = trim(both '-' from regexp_replace(lower("title"), '[^a-z0-9]+', '-', 'g')) || '-' || substr("id", 1, 6)
WHERE "slug" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_key" ON "Post"("slug");

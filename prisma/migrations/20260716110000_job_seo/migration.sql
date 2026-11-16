-- SEO por vaga (slug + meta + palavra-chave de foco).
ALTER TABLE "JobListing" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "JobListing" ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;
ALTER TABLE "JobListing" ADD COLUMN IF NOT EXISTS "focusKeyword" TEXT;

-- Slug inicial a partir do título (transliterado) + sufixo do id.
UPDATE "JobListing"
SET "slug" = trim(both '-' from regexp_replace(
  translate(
    lower("title"),
    'àáâãäåāèéêëēìíîïīòóôõöøōùúûüūçñýÿ',
    'aaaaaaaeeeeeiiiiiooooooouuuuucnyy'
  ),
  '[^a-z0-9]+', '-', 'g'
)) || '-' || substr("id", 1, 6)
WHERE "slug" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "JobListing_slug_key" ON "JobListing"("slug");

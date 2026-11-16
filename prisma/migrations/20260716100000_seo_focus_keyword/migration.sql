-- Palavra-chave de foco para a análise SEO (estilo Yoast).
ALTER TABLE "PageMeta" ADD COLUMN IF NOT EXISTS "focusKeyword" TEXT;
ALTER TABLE "NewsArticle" ADD COLUMN IF NOT EXISTS "focusKeyword" TEXT;

-- Mini-CMS de SEO: metadados editáveis por página.
CREATE TABLE IF NOT EXISTS "PageMeta" (
  "id" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "title" TEXT,
  "metaDescription" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PageMeta_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PageMeta_path_key" ON "PageMeta"("path");

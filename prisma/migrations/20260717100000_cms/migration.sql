-- CMS: papel de editor, categoria de notícias, páginas livres, revisões,
-- biblioteca de média e registo de atividade.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EDITOR';

ALTER TABLE "NewsArticle" ADD COLUMN IF NOT EXISTS "category" TEXT;

CREATE TABLE IF NOT EXISTS "CmsPage" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "content" TEXT NOT NULL DEFAULT '',
  "metaDescription" TEXT,
  "focusKeyword" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CmsPage_slug_key" ON "CmsPage"("slug");

CREATE TABLE IF NOT EXISTS "ContentRevision" (
  "id" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "authorId" TEXT,
  "authorName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ContentRevision_entityType_entityId_createdAt_idx" ON "ContentRevision"("entityType", "entityId", "createdAt");

CREATE TABLE IF NOT EXISTS "MediaItem" (
  "id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "title" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MediaItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "MediaItem_createdAt_idx" ON "MediaItem"("createdAt");

CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "actorName" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "summary" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

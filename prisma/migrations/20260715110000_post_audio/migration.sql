-- Suporte a posts de áudio.
ALTER TYPE "PostType" ADD VALUE IF NOT EXISTS 'AUDIO';
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "audioUrl" TEXT;

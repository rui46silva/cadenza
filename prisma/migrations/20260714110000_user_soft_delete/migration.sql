-- Soft-delete de contas com possibilidade de recuperação (rollback).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");

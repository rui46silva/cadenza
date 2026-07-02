-- Remove duplicate notifications for the same comment (kept happening on
-- every demo reseed, since there was no unique constraint to stop it).
-- Keeps one row per commentId, preferring an unread one if it exists.
DELETE FROM "Notification" a
USING "Notification" b
WHERE a."id" <> b."id"
  AND a."commentId" IS NOT NULL
  AND a."commentId" = b."commentId"
  AND (
    (a."read" = true AND b."read" = false)
    OR (a."read" = b."read" AND a."id" > b."id")
  );

-- AlterTable
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_key" UNIQUE ("commentId");

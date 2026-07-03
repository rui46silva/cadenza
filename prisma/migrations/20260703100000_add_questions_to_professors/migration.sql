-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'QUESTION';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isQuestion" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN     "directedToId" TEXT;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_directedToId_fkey" FOREIGN KEY ("directedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

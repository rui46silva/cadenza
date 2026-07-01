-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "bestAnswerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Post_bestAnswerId_key" ON "Post"("bestAnswerId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_bestAnswerId_fkey" FOREIGN KEY ("bestAnswerId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

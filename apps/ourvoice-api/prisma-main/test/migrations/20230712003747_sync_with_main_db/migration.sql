-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "votesDown" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "votesUp" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "content" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "commentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
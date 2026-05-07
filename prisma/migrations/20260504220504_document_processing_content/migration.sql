-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('unprocessed', 'processing', 'processed', 'failed');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('plain_text', 'markdown');

-- AlterTable
ALTER TABLE "UploadedFile" ADD COLUMN     "content" TEXT,
ADD COLUMN     "contentType" "ContentType",
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'unprocessed';

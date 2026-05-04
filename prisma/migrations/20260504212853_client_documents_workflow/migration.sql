-- DropForeignKey
ALTER TABLE "UploadedFile" DROP CONSTRAINT "UploadedFile_reportingWeekId_fkey";

-- AlterTable
ALTER TABLE "UploadedFile" ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "reportingWeekId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_reportingWeekId_fkey" FOREIGN KEY ("reportingWeekId") REFERENCES "ReportingWeek"("id") ON DELETE SET NULL ON UPDATE CASCADE;

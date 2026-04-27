-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CLIENT');

-- CreateEnum
CREATE TYPE "WeekStatus" AS ENUM ('DRAFT', 'FILES_UPLOADED', 'PROCESSED', 'NARRATIVES_GENERATED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "UploadedFileType" AS ENUM ('LOADS', 'FUEL', 'MAINTENANCE', 'DRIVERS', 'TRUCKS', 'SETTLEMENTS', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DashboardSectionKey" AS ENUM ('EXECUTIVE_OVERVIEW', 'TRUCK_PROFITABILITY', 'LANE_PERFORMANCE', 'DRIVER_PERFORMANCE', 'COST_TRENDS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientAssumption" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "defaultMpg" DOUBLE PRECISION NOT NULL DEFAULT 6.5,
    "defaultFuelPrice" DOUBLE PRECISION NOT NULL DEFAULT 3.8,
    "defaultMaintenancePerMile" DOUBLE PRECISION NOT NULL DEFAULT 0.12,
    "defaultFixedCostPerTruck" DOUBLE PRECISION NOT NULL DEFAULT 900,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientAssumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportingWeek" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "label" TEXT NOT NULL,
    "status" "WeekStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportingWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "reportingWeekId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileType" "UploadedFileType" NOT NULL DEFAULT 'UNKNOWN',
    "classificationConfidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardSection" (
    "id" TEXT NOT NULL,
    "reportingWeekId" TEXT NOT NULL,
    "sectionKey" "DashboardSectionKey" NOT NULL,
    "title" TEXT NOT NULL,
    "metricsJson" JSONB NOT NULL,
    "chartDataJson" JSONB NOT NULL,
    "narrativeJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_slug_key" ON "Client"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAssumption_clientId_key" ON "ClientAssumption"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportingWeek_clientId_weekStart_key" ON "ReportingWeek"("clientId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardSection_reportingWeekId_sectionKey_key" ON "DashboardSection"("reportingWeekId", "sectionKey");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAssumption" ADD CONSTRAINT "ClientAssumption_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportingWeek" ADD CONSTRAINT "ReportingWeek_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_reportingWeekId_fkey" FOREIGN KEY ("reportingWeekId") REFERENCES "ReportingWeek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardSection" ADD CONSTRAINT "DashboardSection_reportingWeekId_fkey" FOREIGN KEY ("reportingWeekId") REFERENCES "ReportingWeek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

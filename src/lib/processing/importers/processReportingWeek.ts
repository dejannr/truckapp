import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { parseUploadedFiles } from "@/lib/processing/parsers/parseUploadedFiles";
import { classifyParsedFiles } from "@/lib/processing/classifiers/classifyParsedFiles";
import { normalizeClassifiedFiles } from "@/lib/processing/normalizers/normalizeClassifiedFiles";
import { calculateDashboardSections } from "@/lib/processing/calculators";
import type { ImportResult } from "@/types/normalized";

export async function processReportingWeek(weekId: string): Promise<ImportResult> {
  const week = await prisma.reportingWeek.findUnique({
    where: { id: weekId },
    include: {
      client: { include: { assumptions: true } },
      uploadedFiles: true,
    },
  });
  if (!week) throw new Error("Week not found");

  const parsedFiles = await parseUploadedFiles(week.uploadedFiles);
  const classified = classifyParsedFiles(parsedFiles);

  for (const file of classified) {
    await prisma.uploadedFile.update({
      where: { id: file.uploadedFileId },
      data: {
        fileType: file.fileType,
        classificationConfidence: file.confidence,
      },
    });
  }

  const normalized = normalizeClassifiedFiles(classified, {
    clientId: week.clientId,
    weekId,
  });

  const previousWeek = await prisma.reportingWeek.findFirst({
    where: { clientId: week.clientId, weekStart: { lt: week.weekStart } },
    orderBy: { weekStart: "desc" },
    include: { sections: true },
  });

  const assumptions = week.client.assumptions || {
    defaultMpg: 6.5,
    defaultFuelPrice: 3.8,
    defaultMaintenancePerMile: 0.12,
    defaultFixedCostPerTruck: 900,
    targetGrossMarginPct: 15,
    targetDeadheadPct: 15,
  };

  const sections = calculateDashboardSections(normalized, {
    assumptions,
    previousSections: previousWeek?.sections || [],
  });

  for (const section of sections) {
    await prisma.dashboardSection.upsert({
      where: {
        reportingWeekId_sectionKey: {
          reportingWeekId: weekId,
          sectionKey: section.sectionKey,
        }
      },
      create: {
        reportingWeekId: weekId,
        sectionKey: section.sectionKey,
        title: section.title,
        metricsJson: section.metrics as Prisma.InputJsonValue,
        chartDataJson: section.chartData as Prisma.InputJsonValue,
      },
      update: {
        title: section.title,
        metricsJson: section.metrics as Prisma.InputJsonValue,
        chartDataJson: section.chartData as Prisma.InputJsonValue,
      }
    });
  }

  await prisma.reportingWeek.update({
    where: { id: weekId },
    data: { status: "PROCESSED" },
  });

  const warnings: string[] = [];
  if (!normalized.fuelTransactions.length) warnings.push("No fuel file found. Fuel cost estimated from assumptions.");
  if (!normalized.maintenanceRecords.length) warnings.push("No maintenance file found. Maintenance cost estimated.");
  if (!normalized.drivers.length) warnings.push("No driver file found. Driver insights are limited.");

  return {
    filesProcessed: classified.length,
    warnings,
    errors: [],
    normalizedCounts: {
      loads: normalized.loads.length,
      fuelTransactions: normalized.fuelTransactions.length,
      maintenanceRecords: normalized.maintenanceRecords.length,
      drivers: normalized.drivers.length,
      trucks: normalized.trucks.length,
    }
  };
}

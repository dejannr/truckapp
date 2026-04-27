import type { NormalizedDataBundle } from "@/types/normalized";

export function buildDataQuality(data: NormalizedDataBundle, estimatedFields: string[] = []) {
  const missingFiles: string[] = [];
  const actualFuelData = data.fuelTransactions.length > 0;
  const actualMaintenanceData = data.maintenanceRecords.length > 0;
  const actualDriverData = data.drivers.length > 0 || data.loads.some((l) => Boolean(l.driverId));

  if (!actualFuelData) missingFiles.push("FUEL");
  if (!actualMaintenanceData) missingFiles.push("MAINTENANCE");
  if (!actualDriverData) missingFiles.push("DRIVERS");

  const base = 100;
  const confidenceScore = Math.max(25, base - missingFiles.length * 20 - estimatedFields.length * 4);

  return {
    actualFuelData,
    actualMaintenanceData,
    actualDriverData,
    estimatedFields,
    missingFiles,
    confidenceScore,
  };
}

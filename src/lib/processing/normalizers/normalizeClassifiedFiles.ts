import type { ClassifiedFile } from "@/lib/processing/classifiers/classifyParsedFiles";
import type { NormalizedDataBundle } from "@/types/normalized";

function n(v: unknown): number | undefined {
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v === "string") {
    const cleaned = Number(v.replaceAll(/[^\d.-]/g, ""));
    return Number.isFinite(cleaned) ? cleaned : undefined;
  }
  return undefined;
}

function s(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  const str = String(v).trim();
  return str || undefined;
}

export function normalizeClassifiedFiles(
  files: ClassifiedFile[],
  context: { clientId: string; weekId: string }
): NormalizedDataBundle {
  const out: NormalizedDataBundle = {
    loads: [],
    fuelTransactions: [],
    maintenanceRecords: [],
    drivers: [],
    trucks: [],
  };

  for (const file of files) {
    for (const row of file.rows) {
      if (file.fileType === "LOADS") {
        out.loads.push({
          clientId: context.clientId,
          weekId: context.weekId,
          loadId: s(row.loadId ?? row.load ?? row.id),
          truckId: s(row.truckId ?? row.truck ?? row.unit),
          driverId: s(row.driverId ?? row.driver),
          originCity: s(row.originCity ?? row.origin),
          originState: s(row.originState),
          destinationCity: s(row.destinationCity ?? row.destination),
          destinationState: s(row.destinationState),
          revenue: n(row.revenue ?? row.rate ?? row.amount),
          loadedMiles: n(row.loadedMiles ?? row.milesLoaded ?? row.loaded_miles),
          deadheadMiles: n(row.deadheadMiles ?? row.emptyMiles ?? row.deadhead),
          broker: s(row.broker),
          commodity: s(row.commodity),
        });
      }
      if (file.fileType === "FUEL") {
        out.fuelTransactions.push({
          clientId: context.clientId,
          weekId: context.weekId,
          truckId: s(row.truckId ?? row.truck ?? row.unit),
          driverId: s(row.driverId ?? row.driver),
          date: s(row.date),
          gallons: n(row.gallons),
          totalCost: n(row.totalCost ?? row.amount ?? row.cost),
          pricePerGallon: n(row.pricePerGallon ?? row.price),
          location: s(row.location ?? row.station),
          odometer: n(row.odometer),
        });
      }
      if (file.fileType === "MAINTENANCE") {
        out.maintenanceRecords.push({
          clientId: context.clientId,
          weekId: context.weekId,
          truckId: s(row.truckId ?? row.truck ?? row.unit),
          date: s(row.date),
          category: s(row.category ?? row.service),
          description: s(row.description ?? row.repair),
          cost: n(row.cost ?? row.amount),
          vendor: s(row.vendor ?? row.shop),
        });
      }
      if (file.fileType === "DRIVERS") {
        out.drivers.push({
          clientId: context.clientId,
          driverId: s(row.driverId ?? row.id),
          name: s(row.name ?? row.driver),
          assignedTruckId: s(row.assignedTruckId ?? row.truck),
          status: s(row.status),
        });
      }
      if (file.fileType === "TRUCKS") {
        out.trucks.push({
          clientId: context.clientId,
          truckId: s(row.truckId ?? row.id ?? row.unit),
          unitNumber: s(row.unitNumber ?? row.unit),
          vin: s(row.vin),
          make: s(row.make),
          model: s(row.model),
          year: n(row.year),
          status: s(row.status),
        });
      }
    }
  }

  return out;
}

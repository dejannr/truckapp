import type { NormalizedDataBundle } from "@/types/normalized";
import { safeDivide } from "@/lib/processing/calculators/utils/safeMath";

export type CalcContext = {
  assumptions: {
    defaultMpg: number;
    defaultFuelPrice: number;
    defaultMaintenancePerMile: number;
    defaultFixedCostPerTruck: number;
    targetGrossMarginPct?: number;
    targetDeadheadPct?: number;
  };
  previousSections: Array<{ sectionKey: string; metricsJson: unknown }>;
};

export function sum(values: Array<number | undefined>): number {
  return values.reduce<number>((acc, cur) => acc + (cur || 0), 0);
}

export function baseAggregates(data: NormalizedDataBundle, ctx: CalcContext) {
  const totalRevenue = sum(data.loads.map((l) => l.revenue));
  const loadedMiles = sum(data.loads.map((l) => l.loadedMiles));
  const deadheadMiles = sum(data.loads.map((l) => l.deadheadMiles));
  const totalMiles = loadedMiles + deadheadMiles;

  const fuelFromData = sum(data.fuelTransactions.map((f) => f.totalCost));
  const fuelEstimated = !fuelFromData;
  const estimatedFuelCost = safeDivide(totalMiles, ctx.assumptions.defaultMpg, 0) * ctx.assumptions.defaultFuelPrice;
  const fuelCost = fuelFromData || estimatedFuelCost;

  const maintFromData = sum(data.maintenanceRecords.map((m) => m.cost));
  const maintenanceEstimated = !maintFromData;
  const maintenanceCost = maintFromData || totalMiles * ctx.assumptions.defaultMaintenancePerMile;

  const activeTruckCount = new Set(data.loads.map((l) => l.truckId).filter(Boolean)).size || 10;
  const fixedCost = activeTruckCount * ctx.assumptions.defaultFixedCostPerTruck;

  const totalCost = fuelCost + maintenanceCost + fixedCost;
  const estimatedProfit = totalRevenue - totalCost;

  return {
    totalRevenue,
    loadedMiles,
    deadheadMiles,
    totalMiles,
    fuelCost,
    maintenanceCost,
    fixedCost,
    totalCost,
    estimatedProfit,
    loadCount: data.loads.length,
    activeTruckCount,
    assumptionsUsed: {
      fuelEstimated,
      maintenanceEstimated,
    },
  };
}

export function previousMetric(
  previousSections: CalcContext["previousSections"],
  sectionKey: string,
  metricKey: string
): number {
  const section = previousSections.find((s) => s.sectionKey === sectionKey);
  if (!section || !section.metricsJson || typeof section.metricsJson !== "object") return 0;
  const value = (section.metricsJson as Record<string, unknown>)[metricKey];
  return typeof value === "number" ? value : 0;
}

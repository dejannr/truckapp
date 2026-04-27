import type { DashboardSectionMetrics } from "@/types/dashboard";
import type { NormalizedDataBundle } from "@/types/normalized";
import { baseAggregates, type CalcContext } from "@/lib/processing/calculators/helpers";
import { buildDataQuality } from "@/lib/processing/calculators/utils/dataQuality";
import { percent, roundCurrency, roundNumber, safeDivide } from "@/lib/processing/calculators/utils/safeMath";

export function calculateTruckProfitability(data: NormalizedDataBundle, ctx: CalcContext): DashboardSectionMetrics {
  const base = baseAggregates(data, ctx);
  const grouped = new Map<string, {
    truckId: string;
    revenue: number;
    loadedMiles: number;
    deadheadMiles: number;
    loads: number;
  }>();

  for (const load of data.loads) {
    const truckId = load.truckId || "UNASSIGNED";
    const bucket = grouped.get(truckId) || { truckId, revenue: 0, loadedMiles: 0, deadheadMiles: 0, loads: 0 };
    bucket.revenue += load.revenue || 0;
    bucket.loadedMiles += load.loadedMiles || 0;
    bucket.deadheadMiles += load.deadheadMiles || 0;
    bucket.loads += 1;
    grouped.set(truckId, bucket);
  }

  const maintenanceByTruck = data.maintenanceRecords.reduce((acc, cur) => {
    const truck = cur.truckId || "UNASSIGNED";
    acc[truck] = (acc[truck] || 0) + (cur.cost || 0);
    return acc;
  }, {} as Record<string, number>);

  const fleetAvgMaintenance = Object.values(maintenanceByTruck).length
    ? Object.values(maintenanceByTruck).reduce((a, b) => a + b, 0) / Object.values(maintenanceByTruck).length
    : 0;

  const fuelShare = safeDivide(base.fuelCost, Math.max(1, base.totalMiles), 0);
  const maintenanceShare = safeDivide(base.maintenanceCost, Math.max(1, base.totalMiles), 0);

  const maxLoads = Math.max(1, ...Array.from(grouped.values()).map((x) => x.loads));
  const maxRevenue = Math.max(1, ...Array.from(grouped.values()).map((x) => x.revenue));

  const trucks = Array.from(grouped.values()).map((t) => {
    const totalMiles = t.loadedMiles + t.deadheadMiles;
    const totalCost = totalMiles * (fuelShare + maintenanceShare);
    const maintenanceCost = maintenanceByTruck[t.truckId] || totalMiles * maintenanceShare;
    const estimatedProfit = t.revenue - totalCost;
    const loadedPct = percent(t.loadedMiles, totalMiles);
    const utilizationScore = Math.round(
      Math.max(0, Math.min(100,
        loadedPct * 0.4 +
        safeDivide(t.loads, maxLoads, 0) * 100 * 0.25 +
        safeDivide(t.revenue, maxRevenue, 0) * 100 * 0.35
      ))
    );

    let maintenanceRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (fleetAvgMaintenance > 0 && maintenanceCost > fleetAvgMaintenance * 1.5) maintenanceRisk = "HIGH";
    else if (fleetAvgMaintenance > 0 && maintenanceCost > fleetAvgMaintenance * 1.2) maintenanceRisk = "MEDIUM";

    return {
      truckId: t.truckId,
      revenue: roundCurrency(t.revenue),
      totalCost: roundCurrency(totalCost),
      estimatedProfit: roundCurrency(estimatedProfit),
      loadedMiles: roundNumber(t.loadedMiles),
      deadheadMiles: roundNumber(t.deadheadMiles),
      totalMiles: roundNumber(totalMiles),
      costPerMile: roundNumber(safeDivide(totalCost, totalMiles, 0), 3),
      revenuePerLoadedMile: roundNumber(safeDivide(t.revenue, t.loadedMiles, 0), 3),
      profitPerMile: roundNumber(safeDivide(estimatedProfit, totalMiles, 0), 3),
      deadheadPercentage: roundNumber(percent(t.deadheadMiles, totalMiles), 2),
      loadsCompleted: t.loads,
      utilizationScore,
      maintenanceRisk,
    };
  }).sort((a, b) => b.estimatedProfit - a.estimatedProfit);

  return {
    sectionKey: "TRUCK_PROFITABILITY",
    title: "Truck Profitability",
    metrics: {
      summary: {
        truckCount: trucks.length,
      },
      rows: trucks,
      highlights: {
        best: trucks[0] || null,
        worst: trucks[trucks.length - 1] || null,
        risks: trucks.filter((t) => t.maintenanceRisk !== "LOW").slice(0, 3),
      },
      dataQuality: buildDataQuality(data, [
        ...(base.assumptionsUsed.fuelEstimated ? ["truckFuelCostAllocation"] : []),
        ...(base.assumptionsUsed.maintenanceEstimated ? ["truckMaintenanceCostAllocation"] : []),
      ]),
    },
    chartData: {
      categories: trucks.map((t) => t.truckId),
      values: trucks.map((t) => t.estimatedProfit),
      tableRows: trucks,
    }
  };
}

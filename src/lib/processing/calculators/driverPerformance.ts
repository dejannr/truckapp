import type { DashboardSectionMetrics } from "@/types/dashboard";
import type { NormalizedDataBundle } from "@/types/normalized";
import type { CalcContext } from "@/lib/processing/calculators/helpers";
import { baseAggregates } from "@/lib/processing/calculators/helpers";
import { buildDataQuality } from "@/lib/processing/calculators/utils/dataQuality";
import { percent, roundCurrency, roundNumber, safeDivide } from "@/lib/processing/calculators/utils/safeMath";

export function calculateDriverPerformance(data: NormalizedDataBundle, ctx: CalcContext): DashboardSectionMetrics {
  const base = baseAggregates(data, ctx);
  const byDriver = new Map<string, { driver: string; truck: string; revenue: number; loadedMiles: number; deadheadMiles: number; loads: number }>();

  for (const load of data.loads) {
    const driver = load.driverId || "Unassigned";
    const truck = load.truckId || "Unassigned";
    const bucket = byDriver.get(driver) || { driver, truck, revenue: 0, loadedMiles: 0, deadheadMiles: 0, loads: 0 };
    bucket.revenue += load.revenue || 0;
    bucket.loadedMiles += load.loadedMiles || 0;
    bucket.deadheadMiles += load.deadheadMiles || 0;
    bucket.loads += 1;
    byDriver.set(driver, bucket);
  }

  const costPerMile = safeDivide(base.totalCost, base.totalMiles, 0);
  const driversRaw = Array.from(byDriver.values()).map((d) => {
    const totalMiles = d.loadedMiles + d.deadheadMiles;
    const estimatedCost = totalMiles * costPerMile;
    const driverProfit = d.revenue - estimatedCost;
    const idleHours = safeDivide(d.deadheadMiles, 35, 0);
    const idleCostEstimate = idleHours * 0.8 * ctx.assumptions.defaultFuelPrice;
    const loadedMilesPct = percent(d.loadedMiles, totalMiles);
    const fuelEfficiency = null;
    const onTimePercentage = null;

    const metrics: Array<{ value: number; weight: number }> = [
      { value: Math.max(0, Math.min(100, safeDivide(driverProfit, Math.max(1, d.revenue), 0) * 100)), weight: 30 },
      { value: loadedMilesPct, weight: 25 },
      { value: fuelEfficiency ?? 70, weight: fuelEfficiency == null ? 0 : 20 },
      { value: onTimePercentage ?? 85, weight: onTimePercentage == null ? 0 : 15 },
      { value: Math.max(0, Math.min(100, 100 - safeDivide(idleCostEstimate, Math.max(1, d.revenue), 0) * 1000)), weight: 10 },
    ];

    const totalWeight = metrics.reduce((acc, cur) => acc + cur.weight, 0) || 1;
    const score = metrics.reduce((acc, cur) => acc + cur.value * cur.weight, 0) / totalWeight;

    return {
      driverId: d.driver,
      assignedTruck: d.truck,
      totalRevenue: roundCurrency(d.revenue),
      profitContribution: roundCurrency(driverProfit),
      totalMiles: roundNumber(totalMiles),
      loadedMiles: roundNumber(d.loadedMiles),
      deadheadMiles: roundNumber(d.deadheadMiles),
      loadedMilesPct: roundNumber(loadedMilesPct),
      revenuePerLoadedMile: roundNumber(safeDivide(d.revenue, d.loadedMiles, 0), 3),
      profitPerMile: roundNumber(safeDivide(driverProfit, totalMiles, 0), 3),
      idleCostEstimate: roundCurrency(idleCostEstimate),
      fuelEfficiency,
      onTimePercentage,
      loadsCompleted: d.loads,
      driverEfficiencyScore: Math.round(score),
    };
  });

  const drivers = driversRaw.sort((a, b) => b.driverEfficiencyScore - a.driverEfficiencyScore);

  return {
    sectionKey: "DRIVER_PERFORMANCE",
    title: "Driver Performance",
    metrics: {
      summary: {
        driverCount: drivers.length,
      },
      rows: drivers,
      highlights: {
        best: drivers[0] || null,
        worst: drivers[drivers.length - 1] || null,
      },
      dataQuality: buildDataQuality(data, ["driverCostAllocation", "idleCostEstimate"]),
    },
    chartData: {
      categories: drivers.map((d) => d.driverId),
      scoreValues: drivers.map((d) => d.driverEfficiencyScore),
      profitPerMile: drivers.map((d) => d.profitPerMile),
      tableRows: drivers,
    }
  };
}

import type { DashboardSectionMetrics } from "@/types/dashboard";
import type { NormalizedDataBundle } from "@/types/normalized";
import { baseAggregates, type CalcContext } from "@/lib/processing/calculators/helpers";
import { buildDataQuality } from "@/lib/processing/calculators/utils/dataQuality";
import { percent, roundCurrency, roundNumber, safeDivide } from "@/lib/processing/calculators/utils/safeMath";

export function calculateExecutiveOverview(data: NormalizedDataBundle, ctx: CalcContext): DashboardSectionMetrics {
  const base = baseAggregates(data, ctx);
  const grossMarginPct = percent(base.estimatedProfit, base.totalRevenue);
  const revenuePerTruck = safeDivide(base.totalRevenue, base.activeTruckCount, 0);
  const profitPerMile = safeDivide(base.estimatedProfit, base.totalMiles, 0);
  const loadedMilesPct = percent(base.loadedMiles, base.totalMiles);
  const averageLoadValue = safeDivide(base.totalRevenue, base.loadCount, 0);
  const loadsPerTruck = safeDivide(base.loadCount, base.activeTruckCount, 0);
  const breakEvenRatePerMile = safeDivide(base.totalCost, base.loadedMiles, 0);
  const avgRatePerMile = safeDivide(base.totalRevenue, base.loadedMiles, 0);

  const estimatedFields: string[] = [];
  if (base.assumptionsUsed.fuelEstimated) estimatedFields.push("fuelCost", "fuelCostPerMile");
  if (base.assumptionsUsed.maintenanceEstimated) estimatedFields.push("maintenanceCost");

  return {
    sectionKey: "EXECUTIVE_OVERVIEW",
    title: "Executive Overview",
    metrics: {
      summary: {
        totalRevenue: roundCurrency(base.totalRevenue),
        estimatedProfit: roundCurrency(base.estimatedProfit),
        grossMarginPct: roundNumber(grossMarginPct),
        revenuePerTruck: roundCurrency(revenuePerTruck),
        profitPerTruck: roundCurrency(safeDivide(base.estimatedProfit, base.activeTruckCount, 0)),
        profitPerMile: roundNumber(profitPerMile, 3),
        averageRatePerMile: roundNumber(avgRatePerMile, 3),
        breakEvenRatePerMile: roundNumber(breakEvenRatePerMile, 3),
        totalLoadedMiles: roundNumber(base.loadedMiles),
        totalDeadheadMiles: roundNumber(base.deadheadMiles),
        deadheadPercentage: roundNumber(percent(base.deadheadMiles, base.totalMiles)),
        loadedMilesPct: roundNumber(loadedMilesPct),
        numberOfLoads: base.loadCount,
        averageLoadValue: roundCurrency(averageLoadValue),
        loadsPerTruck: roundNumber(loadsPerTruck),
        fuelCostPerMile: roundNumber(safeDivide(base.fuelCost, base.totalMiles, 0), 3),
        revenueAboveBreakEven: roundCurrency(base.totalRevenue - base.totalCost),
        activeTruckCount: base.activeTruckCount,
      },
      dataQuality: buildDataQuality(data, estimatedFields),
    },
    chartData: {
      kpiCards: [
        { label: "Revenue", value: roundCurrency(base.totalRevenue) },
        { label: "Profit", value: roundCurrency(base.estimatedProfit) },
        { label: "Gross Margin %", value: roundNumber(grossMarginPct) },
        { label: "Revenue / Truck", value: roundCurrency(revenuePerTruck) },
        { label: "Profit / Mile", value: roundNumber(profitPerMile, 3) },
        { label: "Avg Rate / Mile", value: roundNumber(avgRatePerMile, 3) },
        { label: "Break-even Rate / Mile", value: roundNumber(breakEvenRatePerMile, 3) },
        { label: "Deadhead %", value: roundNumber(percent(base.deadheadMiles, base.totalMiles)) },
        { label: "Loads", value: base.loadCount },
        { label: "Fuel Cost / Mile", value: roundNumber(safeDivide(base.fuelCost, base.totalMiles, 0), 3) },
      ],
      revenueProfitBars: [
        { metric: "Revenue", value: roundCurrency(base.totalRevenue) },
        { metric: "Profit", value: roundCurrency(base.estimatedProfit) },
      ],
    }
  };
}

import type { DashboardSectionMetrics } from "@/types/dashboard";
import type { NormalizedDataBundle } from "@/types/normalized";
import { baseAggregates, type CalcContext } from "@/lib/processing/calculators/helpers";
import { buildDataQuality } from "@/lib/processing/calculators/utils/dataQuality";
import { percent, roundCurrency, roundNumber, safeDivide } from "@/lib/processing/calculators/utils/safeMath";

export function calculateCostTrends(data: NormalizedDataBundle, ctx: CalcContext): DashboardSectionMetrics {
  const base = baseAggregates(data, ctx);

  const maintenanceByTruck = data.maintenanceRecords.reduce((acc, cur) => {
    const truck = cur.truckId || "UNASSIGNED";
    acc[truck] = (acc[truck] || 0) + (cur.cost || 0);
    return acc;
  }, {} as Record<string, number>);

  const fuelByTruck = data.fuelTransactions.reduce((acc, cur) => {
    const truck = cur.truckId || "UNASSIGNED";
    acc[truck] = (acc[truck] || 0) + (cur.totalCost || 0);
    return acc;
  }, {} as Record<string, number>);

  const variableCosts = base.fuelCost + base.maintenanceCost;
  const fixedCosts = base.fixedCost;
  const driverPay = base.totalRevenue * 0.28;
  const otherFixedCosts = Math.max(0, fixedCosts - driverPay);
  const totalOperatingCost = fixedCosts + variableCosts;

  const maintenanceCostPerMile = safeDivide(base.maintenanceCost, base.totalMiles, 0);
  const fuelCostPerMile = safeDivide(base.fuelCost, base.totalMiles, 0);
  const grossMarginPct = percent(base.estimatedProfit, base.totalRevenue);
  const deadheadPct = percent(base.deadheadMiles, base.totalMiles);

  const targetGrossMarginPct = ctx.assumptions.targetGrossMarginPct ?? 15;
  const targetDeadheadPct = ctx.assumptions.targetDeadheadPct ?? 15;

  const anomalies: string[] = [];
  if (fuelCostPerMile > 0.7) anomalies.push("FUEL_SPIKE");
  if (Object.values(maintenanceByTruck).some((cost) => cost > safeDivide(base.maintenanceCost, Math.max(1, Object.keys(maintenanceByTruck).length), 0) * 1.5)) {
    anomalies.push("MAINTENANCE_SPIKE");
  }
  if (grossMarginPct < targetGrossMarginPct) anomalies.push("LOW_MARGIN");
  if (deadheadPct > targetDeadheadPct) anomalies.push("HIGH_DEADHEAD_COST");

  return {
    sectionKey: "COST_TRENDS",
    title: "Costs & Trends",
    metrics: {
      summary: {
        totalOperatingCost: roundCurrency(totalOperatingCost),
        fuelCost: roundCurrency(base.fuelCost),
        maintenanceCost: roundCurrency(base.maintenanceCost),
        driverPay: roundCurrency(driverPay),
        costPerTotalMile: roundNumber(safeDivide(totalOperatingCost, base.totalMiles, 0), 3),
        costPerLoadedMile: roundNumber(safeDivide(totalOperatingCost, base.loadedMiles, 0), 3),
        fuelPctOfRevenue: roundNumber(percent(base.fuelCost, base.totalRevenue), 2),
        maintenanceCostPerMile: roundNumber(maintenanceCostPerMile, 3),
        fuelCostPerMile: roundNumber(fuelCostPerMile, 3),
        fixedCosts: roundCurrency(otherFixedCosts),
        variableCosts: roundCurrency(variableCosts),
        anomalyFlags: anomalies,
      },
      rows: Object.keys(maintenanceByTruck).map((truckId) => ({
        truckId,
        maintenanceCost: roundCurrency(maintenanceByTruck[truckId] || 0),
        fuelCost: roundCurrency(fuelByTruck[truckId] || 0),
      })),
      dataQuality: buildDataQuality(data, [
        ...(base.assumptionsUsed.fuelEstimated ? ["fuelCosts"] : []),
        ...(base.assumptionsUsed.maintenanceEstimated ? ["maintenanceCosts"] : []),
      ]),
    },
    chartData: {
      costBreakdown: [
        { name: "Fuel", value: roundCurrency(base.fuelCost) },
        { name: "Maintenance", value: roundCurrency(base.maintenanceCost) },
        { name: "Driver Pay", value: roundCurrency(driverPay) },
        { name: "Other", value: roundCurrency(otherFixedCosts) },
      ],
      fuelByTruck: Object.entries(fuelByTruck).map(([truckId, cost]) => ({ truckId, cost: roundCurrency(cost) })),
      maintenanceBars: Object.entries(maintenanceByTruck).map(([truckId, cost]) => ({ truckId, cost: roundCurrency(cost) })),
      costPerMileByTruck: Object.keys(maintenanceByTruck).map((truckId) => {
        const fuel = fuelByTruck[truckId] || 0;
        const maint = maintenanceByTruck[truckId] || 0;
        return {
          truckId,
          costPerMile: roundNumber((fuel + maint) / 1000, 3),
        };
      }),
      last4WeeksTrendLabel: "Last 4 Published Weeks Cost Trend",
    }
  };
}

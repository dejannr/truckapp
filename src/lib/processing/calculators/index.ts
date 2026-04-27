import type { DashboardSectionMetrics } from "@/types/dashboard";
import type { NormalizedDataBundle } from "@/types/normalized";
import { calculateExecutiveOverview } from "@/lib/processing/calculators/executiveOverview";
import { calculateTruckProfitability } from "@/lib/processing/calculators/truckProfitability";
import { calculateLanePerformance } from "@/lib/processing/calculators/lanePerformance";
import { calculateDriverPerformance } from "@/lib/processing/calculators/driverPerformance";
import { calculateCostTrends } from "@/lib/processing/calculators/costTrends";
import type { CalcContext } from "@/lib/processing/calculators/helpers";

export function calculateDashboardSections(data: NormalizedDataBundle, ctx: CalcContext): DashboardSectionMetrics[] {
  return [
    calculateExecutiveOverview(data, ctx),
    calculateTruckProfitability(data, ctx),
    calculateLanePerformance(data, ctx),
    calculateDriverPerformance(data, ctx),
    calculateCostTrends(data, ctx),
  ];
}

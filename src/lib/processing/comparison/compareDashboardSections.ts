import type { DashboardSection } from "@prisma/client";
import { compareExecutiveOverview } from "@/lib/processing/comparison/compareExecutiveOverview";
import { compareTruckProfitability } from "@/lib/processing/comparison/compareTruckProfitability";
import { compareLanePerformance } from "@/lib/processing/comparison/compareLanePerformance";
import { compareDriverPerformance } from "@/lib/processing/comparison/compareDriverPerformance";
import { compareCostTrends } from "@/lib/processing/comparison/compareCostTrends";
import type { ComparisonSectionResult, SectionShape } from "@/lib/processing/comparison/types";

export function compareDashboardSections(
  selectedSections: DashboardSection[],
  compareSections: DashboardSection[]
): ComparisonSectionResult[] {
  const selectedMap = new Map(selectedSections.map((s) => [s.sectionKey, s]));
  const compareMap = new Map(compareSections.map((s) => [s.sectionKey, s]));

  const out: ComparisonSectionResult[] = [];

  for (const key of selectedMap.keys()) {
    const selected = selectedMap.get(key) as unknown as SectionShape | undefined;
    const compare = compareMap.get(key) as unknown as SectionShape | undefined;
    if (!selected || !compare) continue;

    if (key === "EXECUTIVE_OVERVIEW") out.push(compareExecutiveOverview(selected, compare));
    if (key === "TRUCK_PROFITABILITY") out.push(compareTruckProfitability(selected, compare));
    if (key === "LANE_PERFORMANCE") out.push(compareLanePerformance(selected, compare));
    if (key === "DRIVER_PERFORMANCE") out.push(compareDriverPerformance(selected, compare));
    if (key === "COST_TRENDS") out.push(compareCostTrends(selected, compare));
  }

  return out;
}

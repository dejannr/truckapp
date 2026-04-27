import type { ComparisonSectionResult, SectionShape } from "@/lib/processing/comparison/types";
import { summaryOf } from "@/lib/processing/comparison/types";
import { compareNumeric } from "@/lib/processing/comparison/common";

export function compareExecutiveOverview(selected: SectionShape, compare: SectionShape): ComparisonSectionResult {
  const s = summaryOf(selected);
  const c = summaryOf(compare);

  return {
    sectionKey: "EXECUTIVE_OVERVIEW",
    metrics: {
      revenue: compareNumeric(Number(s.totalRevenue || 0), Number(c.totalRevenue || 0)),
      profit: compareNumeric(Number(s.estimatedProfit || 0), Number(c.estimatedProfit || 0)),
      grossMarginPct: compareNumeric(Number(s.grossMarginPct || 0), Number(c.grossMarginPct || 0)),
      profitPerMile: compareNumeric(Number(s.profitPerMile || 0), Number(c.profitPerMile || 0)),
      deadheadPercentage: compareNumeric(Number(s.deadheadPercentage || 0), Number(c.deadheadPercentage || 0)),
      fuelCostPerMile: compareNumeric(Number(s.fuelCostPerMile || 0), Number(c.fuelCostPerMile || 0)),
      numberOfLoads: compareNumeric(Number(s.numberOfLoads || 0), Number(c.numberOfLoads || 0)),
    },
    chartOverlays: {
      revenueProfitOverlay: {
        labels: ["Compared", "Selected"],
        revenue: [Number(c.totalRevenue || 0), Number(s.totalRevenue || 0)],
        profit: [Number(c.estimatedProfit || 0), Number(s.estimatedProfit || 0)],
      }
    },
  };
}

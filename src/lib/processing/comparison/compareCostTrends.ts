import type { ComparisonSectionResult, SectionShape } from "@/lib/processing/comparison/types";
import { summaryOf } from "@/lib/processing/comparison/types";
import { compareNumeric } from "@/lib/processing/comparison/common";

export function compareCostTrends(selected: SectionShape, compare: SectionShape): ComparisonSectionResult {
  const s = summaryOf(selected);
  const c = summaryOf(compare);

  const fuelCurrent = Number(s.fuelCostTotal || s.fuelCost || 0);
  const fuelPrev = Number(c.fuelCostTotal || c.fuelCost || 0);
  const maintCurrent = Number(s.maintenanceCostTotal || s.maintenanceCost || 0);
  const maintPrev = Number(c.maintenanceCostTotal || c.maintenanceCost || 0);
  const cpmCurrent = Number(s.costPerTotalMile || s.costPerMile || 0);
  const cpmPrev = Number(c.costPerTotalMile || c.costPerMile || 0);

  const biggestMovement = Math.abs(fuelCurrent - fuelPrev) >= Math.abs(maintCurrent - maintPrev)
    ? "FUEL"
    : "MAINTENANCE";

  return {
    sectionKey: "COST_TRENDS",
    metrics: {
      fuelCostChange: compareNumeric(fuelCurrent, fuelPrev),
      maintenanceChange: compareNumeric(maintCurrent, maintPrev),
      costPerMileChange: compareNumeric(cpmCurrent, cpmPrev),
      biggestMovement,
      anomalyChange: {
        selected: s.anomalyFlags || [],
        compared: c.anomalyFlags || [],
      },
    },
  };
}

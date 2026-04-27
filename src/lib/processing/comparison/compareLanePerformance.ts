import type { ComparisonSectionResult, SectionShape } from "@/lib/processing/comparison/types";

function byLane(section: SectionShape) {
  const rows = section.chartDataJson?.tableRows || section.metricsJson?.rows || [];
  return new Map(rows.map((r: any) => [String(r.lane), r]));
}

export function compareLanePerformance(selected: SectionShape, compare: SectionShape): ComparisonSectionResult {
  const s = byLane(selected);
  const c = byLane(compare);

  const lanes = Array.from(new Set([...s.keys(), ...c.keys()]));
  const rows = lanes.map((lane) => {
    const sr = (s.get(lane) || {}) as Record<string, unknown>;
    const cr = (c.get(lane) || {}) as Record<string, unknown>;
    return {
      lane,
      selectedProfitPerMile: Number(sr.laneProfitPerMile || sr.averageProfitPerMile || 0),
      compareProfitPerMile: Number(cr.laneProfitPerMile || cr.averageProfitPerMile || 0),
      selectedRatePerMile: Number(sr.laneRevenuePerLoadedMile || sr.averageRatePerMile || 0),
      compareRatePerMile: Number(cr.laneRevenuePerLoadedMile || cr.averageRatePerMile || 0),
      profitPerMileDelta: Number(sr.laneProfitPerMile || sr.averageProfitPerMile || 0) - Number(cr.laneProfitPerMile || cr.averageProfitPerMile || 0),
    };
  });

  return {
    sectionKey: "LANE_PERFORMANCE",
    metrics: {
      rows,
      newlyStrongLanes: rows.filter((r) => r.profitPerMileDelta > 0.15).slice(0, 5),
      declinedLanes: rows.filter((r) => r.profitPerMileDelta < -0.15).slice(0, 5),
      repeatedAcrossWeeks: rows.filter((r) => r.selectedProfitPerMile !== 0 && r.compareProfitPerMile !== 0).length,
    },
  };
}

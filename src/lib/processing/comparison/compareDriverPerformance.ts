import type { ComparisonSectionResult, SectionShape } from "@/lib/processing/comparison/types";

function byDriver(section: SectionShape) {
  const rows = section.chartDataJson?.tableRows || section.metricsJson?.rows || [];
  return new Map(rows.map((r: any) => [String(r.driverId), r]));
}

export function compareDriverPerformance(selected: SectionShape, compare: SectionShape): ComparisonSectionResult {
  const s = byDriver(selected);
  const c = byDriver(compare);
  const driverIds = Array.from(new Set([...s.keys(), ...c.keys()]));

  const rows = driverIds.map((driverId) => {
    const sr = (s.get(driverId) || {}) as Record<string, unknown>;
    const cr = (c.get(driverId) || {}) as Record<string, unknown>;
    return {
      driverId,
      scoreDelta: Number(sr.driverEfficiencyScore || sr.driverScore || 0) - Number(cr.driverEfficiencyScore || cr.driverScore || 0),
      profitPerMileDelta: Number(sr.profitPerMile || 0) - Number(cr.profitPerMile || 0),
      idleCostDelta: Number(sr.idleCostEstimate || 0) - Number(cr.idleCostEstimate || 0),
      onTimeDelta: Number(sr.onTimePercentage || 0) - Number(cr.onTimePercentage || 0),
    };
  });

  return {
    sectionKey: "DRIVER_PERFORMANCE",
    metrics: {
      rows,
      improved: rows.filter((r) => r.scoreDelta > 0).sort((a, b) => b.scoreDelta - a.scoreDelta).slice(0, 3),
      needsReview: rows.filter((r) => r.scoreDelta < 0).sort((a, b) => a.scoreDelta - b.scoreDelta).slice(0, 3),
    },
  };
}

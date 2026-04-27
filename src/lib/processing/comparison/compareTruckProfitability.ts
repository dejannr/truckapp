import type { ComparisonSectionResult, SectionShape } from "@/lib/processing/comparison/types";

function byTruck(section: SectionShape) {
  const rows = section.chartDataJson?.tableRows || section.metricsJson?.rows || [];
  return new Map(rows.map((r: any) => [String(r.truckId), r]));
}

export function compareTruckProfitability(selected: SectionShape, compare: SectionShape): ComparisonSectionResult {
  const s = byTruck(selected);
  const c = byTruck(compare);
  const truckIds = Array.from(new Set([...s.keys(), ...c.keys()]));

  const rows = truckIds.map((truckId) => {
    const sr = (s.get(truckId) || {}) as Record<string, unknown>;
    const cr = (c.get(truckId) || {}) as Record<string, unknown>;
    return {
      truckId,
      profitPerMileDelta: Number(sr.profitPerMile || 0) - Number(cr.profitPerMile || 0),
      costPerMileDelta: Number(sr.costPerMile || 0) - Number(cr.costPerMile || 0),
      deadheadPctDelta: Number(sr.deadheadPercentage || 0) - Number(cr.deadheadPercentage || 0),
      profitDelta: Number(sr.estimatedProfit || 0) - Number(cr.estimatedProfit || 0),
    };
  });

  const sorted = [...rows].sort((a, b) => b.profitDelta - a.profitDelta);

  return {
    sectionKey: "TRUCK_PROFITABILITY",
    metrics: {
      rows,
      improvedMost: sorted[0] || null,
      declinedMost: sorted[sorted.length - 1] || null,
    },
    chartOverlays: {
      categories: rows.map((r) => r.truckId),
      deltaValues: rows.map((r) => r.profitDelta),
    },
  };
}

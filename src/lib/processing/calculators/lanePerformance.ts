import type { DashboardSectionMetrics } from "@/types/dashboard";
import type { NormalizedDataBundle } from "@/types/normalized";
import type { CalcContext } from "@/lib/processing/calculators/helpers";
import { buildDataQuality } from "@/lib/processing/calculators/utils/dataQuality";
import { roundCurrency, roundNumber, safeDivide } from "@/lib/processing/calculators/utils/safeMath";

type LaneRecommendation = "RUN_MORE" | "MONITOR" | "REDUCE" | "AVOID";

export function calculateLanePerformance(data: NormalizedDataBundle, _ctx: CalcContext): DashboardSectionMetrics {
  const grouped = new Map<string, {
    lane: string;
    loads: number;
    revenue: number;
    loadedMiles: number;
    deadheadMiles: number;
    profits: number[];
    rates: number[];
  }>();

  for (const load of data.loads) {
    const lane = `${load.originCity || "Unknown"}, ${load.originState || "--"} -> ${load.destinationCity || "Unknown"}, ${load.destinationState || "--"}`;
    const bucket = grouped.get(lane) || {
      lane,
      loads: 0,
      revenue: 0,
      loadedMiles: 0,
      deadheadMiles: 0,
      profits: [],
      rates: [],
    };

    const loaded = load.loadedMiles || 0;
    const dead = load.deadheadMiles || 0;
    const revenue = load.revenue || 0;
    const profit = revenue - (loaded + dead) * 1.2;
    const rate = safeDivide(revenue, loaded, 0);

    bucket.loads += 1;
    bucket.revenue += revenue;
    bucket.loadedMiles += loaded;
    bucket.deadheadMiles += dead;
    bucket.profits.push(safeDivide(profit, loaded + dead, 0));
    bucket.rates.push(rate);
    grouped.set(lane, bucket);
  }

  const rows = Array.from(grouped.values()).map((l) => {
    const totalMiles = l.loadedMiles + l.deadheadMiles;
    const laneProfit = l.revenue - totalMiles * 1.2;
    const profitPerMile = safeDivide(laneProfit, totalMiles, 0);
    const revenuePerLoadedMile = safeDivide(l.revenue, l.loadedMiles, 0);
    const avgLoadValue = safeDivide(l.revenue, l.loads, 0);

    const varRate = l.rates.length
      ? l.rates.reduce((acc, cur) => acc + Math.abs(cur - l.rates.reduce((a, b) => a + b, 0) / l.rates.length), 0) / l.rates.length
      : 0;
    const varProfit = l.profits.length
      ? l.profits.reduce((acc, cur) => acc + Math.abs(cur - l.profits.reduce((a, b) => a + b, 0) / l.profits.length), 0) / l.profits.length
      : 0;

    return {
      lane: l.lane,
      loads: l.loads,
      revenue: roundCurrency(l.revenue),
      estimatedProfit: roundCurrency(laneProfit),
      totalMiles: roundNumber(totalMiles),
      loadedMiles: roundNumber(l.loadedMiles),
      deadheadMiles: roundNumber(l.deadheadMiles),
      laneProfitPerMile: roundNumber(profitPerMile, 3),
      laneRevenuePerLoadedMile: roundNumber(revenuePerLoadedMile, 3),
      laneAverageLoadValue: roundCurrency(avgLoadValue),
      laneConsistencyScore: roundNumber(Math.max(0, 100 - (varRate * 20 + varProfit * 50))),
      deadheadBeforeLane: null,
      deadheadAfterLane: null,
      recommendation: "MONITOR" as LaneRecommendation,
    };
  });

  const fleetAvgProfitPerMile = rows.length
    ? rows.reduce((acc, cur) => acc + cur.laneProfitPerMile, 0) / rows.length
    : 0;

  const enriched = rows.map((row) => {
    let recommendation: LaneRecommendation = "MONITOR";
    if (row.laneProfitPerMile >= fleetAvgProfitPerMile * 1.15 && row.loads >= 2) recommendation = "RUN_MORE";
    else if (row.laneProfitPerMile < fleetAvgProfitPerMile * 0.85 && row.loads >= 2) recommendation = "REDUCE";
    if (row.laneProfitPerMile <= 0 || row.laneRevenuePerLoadedMile < 1.2) recommendation = "AVOID";
    return { ...row, recommendation };
  }).sort((a, b) => b.laneProfitPerMile - a.laneProfitPerMile);

  return {
    sectionKey: "LANE_PERFORMANCE",
    title: "Lane / Route Performance",
    metrics: {
      summary: {
        laneCount: enriched.length,
        fleetAvgProfitPerMile: roundNumber(fleetAvgProfitPerMile, 3),
      },
      rows: enriched,
      highlights: {
        best: enriched[0] || null,
        worst: enriched[enriched.length - 1] || null,
      },
      dataQuality: buildDataQuality(data, []),
    },
    chartData: {
      heatRows: enriched.map((l) => ({ lane: l.lane, score: l.laneProfitPerMile, recommendation: l.recommendation })),
      categories: enriched.map((l) => l.lane),
      values: enriched.map((l) => l.laneProfitPerMile),
      tableRows: enriched,
    }
  };
}

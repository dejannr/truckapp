import { BarChart } from "@/components/charts/BarChart";
import { HeatmapTable } from "@/components/charts/HeatmapTable";
import { KpiCard } from "@/components/charts/KpiCard";
import { LineChart } from "@/components/charts/LineChart";
import { RadarChart } from "@/components/charts/RadarChart";
import { NarrativeCard } from "@/components/dashboard/NarrativeCard";
import type { Narrative } from "@/types/dashboard";

type SectionPayload = { sectionKey: string; title: string; metricsJson: any; chartDataJson: any; narrativeJson: Narrative | null };

function currency(value: number) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function num(value: number, digits = 2) {
  return Number(value || 0).toFixed(digits);
}

function pctDelta(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

function DataQualityBlock({ metrics }: { metrics: any }) {
  const dq = metrics?.dataQuality;
  if (!dq) return null;
  return (
    <div className="card text-xs text-slate-700">
      <p className="font-semibold">Data Quality: {dq.confidenceScore}/100</p>
      {dq.estimatedFields?.length ? <p>Estimated fields: {dq.estimatedFields.join(", ")}</p> : null}
      {dq.missingFiles?.length ? <p>Missing files: {dq.missingFiles.join(", ")}</p> : null}
    </div>
  );
}

export function SectionRenderer({
  section,
  comparisonSection,
  comparisonMetrics,
  isComparisonMode,
}: {
  section: SectionPayload;
  comparisonSection?: SectionPayload;
  comparisonMetrics?: Record<string, unknown>;
  isComparisonMode?: boolean;
}) {
  const metrics = section.metricsJson || {};
  const summary = metrics.summary || metrics;
  const rows = metrics.rows || section.chartDataJson?.tableRows || [];
  const chart = section.chartDataJson || {};
  const cmpSummary = comparisonSection ? (comparisonSection.metricsJson?.summary || comparisonSection.metricsJson || {}) : {};

  if (section.sectionKey === "EXECUTIVE_OVERVIEW") {
    const cm = (comparisonMetrics as any)?.metrics || {};
    return (
      <section className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <KpiCard
            label="Revenue"
            value={currency(summary.totalRevenue)}
            compare={isComparisonMode ? { comparedValue: currency(cmpSummary.totalRevenue || 0), pctDelta: pctDelta(Number(summary.totalRevenue || 0), Number(cmpSummary.totalRevenue || 0)) } : undefined}
          />
          <KpiCard
            label="Profit"
            value={currency(summary.estimatedProfit)}
            compare={isComparisonMode ? { comparedValue: currency(cmpSummary.estimatedProfit || 0), pctDelta: pctDelta(Number(summary.estimatedProfit || 0), Number(cmpSummary.estimatedProfit || 0)) } : undefined}
          />
          <KpiCard
            label="Gross Margin %"
            value={`${num(summary.grossMarginPct)}%`}
            compare={isComparisonMode ? { comparedValue: `${num(cmpSummary.grossMarginPct || 0)}%`, pctDelta: pctDelta(Number(summary.grossMarginPct || 0), Number(cmpSummary.grossMarginPct || 0)) } : undefined}
          />
          <KpiCard
            label="Revenue / Truck"
            value={currency(summary.revenuePerTruck)}
            compare={isComparisonMode ? { comparedValue: currency(cmpSummary.revenuePerTruck || 0), pctDelta: pctDelta(Number(summary.revenuePerTruck || 0), Number(cmpSummary.revenuePerTruck || 0)) } : undefined}
          />
          <KpiCard
            label="Profit / Mile"
            value={num(summary.profitPerMile, 3)}
            compare={isComparisonMode ? { comparedValue: num(cmpSummary.profitPerMile || 0, 3), pctDelta: pctDelta(Number(summary.profitPerMile || 0), Number(cmpSummary.profitPerMile || 0)) } : undefined}
          />
          <KpiCard
            label="Avg Rate / Mile"
            value={num(summary.averageRatePerMile, 3)}
            compare={isComparisonMode ? { comparedValue: num(cmpSummary.averageRatePerMile || 0, 3), pctDelta: pctDelta(Number(summary.averageRatePerMile || 0), Number(cmpSummary.averageRatePerMile || 0)) } : undefined}
          />
          <KpiCard
            label="Break-even Rate / Mile"
            value={num(summary.breakEvenRatePerMile, 3)}
            compare={isComparisonMode ? { comparedValue: num(cmpSummary.breakEvenRatePerMile || 0, 3), pctDelta: pctDelta(Number(summary.breakEvenRatePerMile || 0), Number(cmpSummary.breakEvenRatePerMile || 0)) } : undefined}
          />
          <KpiCard
            label="Deadhead %"
            value={`${num(summary.deadheadPercentage)}%`}
            compare={isComparisonMode ? { comparedValue: `${num(cmpSummary.deadheadPercentage || 0)}%`, pctDelta: pctDelta(Number(summary.deadheadPercentage || 0), Number(cmpSummary.deadheadPercentage || 0)) } : undefined}
          />
          <KpiCard
            label="Loads"
            value={String(summary.numberOfLoads || 0)}
            compare={isComparisonMode ? { comparedValue: String(cmpSummary.numberOfLoads || 0), pctDelta: pctDelta(Number(summary.numberOfLoads || 0), Number(cmpSummary.numberOfLoads || 0)) } : undefined}
          />
          <KpiCard
            label="Fuel Cost / Mile"
            value={num(summary.fuelCostPerMile, 3)}
            compare={isComparisonMode ? { comparedValue: num(cmpSummary.fuelCostPerMile || 0, 3), pctDelta: pctDelta(Number(summary.fuelCostPerMile || 0), Number(cmpSummary.fuelCostPerMile || 0)) } : undefined}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <LineChart
              labels={["Revenue", "Profit"]}
              series={[
                { name: "This Week", data: [Number(summary.totalRevenue || 0), Number(summary.estimatedProfit || 0)] },
                ...(isComparisonMode ? [{ name: "Compared Week", data: [Number(cmpSummary.totalRevenue || 0), Number(cmpSummary.estimatedProfit || 0)] }] : []),
              ]}
            />
          </div>
          <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={(comparisonMetrics as any)?.narrative} />
        </div>

        <DataQualityBlock metrics={metrics} />
      </section>
    );
  }

  if (section.sectionKey === "TRUCK_PROFITABILITY") {
    const cmpRowsByTruck = new Map((((comparisonSection?.chartDataJson?.tableRows || []) as any[])).map((r) => [r.truckId, r]));

    return (
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <BarChart
            categories={chart.categories || rows.map((r: any) => r.truckId)}
            series={[
              { name: "This Week", data: chart.values || rows.map((r: any) => Number(r.estimatedProfit || 0)) },
              ...(isComparisonMode ? [{ name: "Compared Week", data: (chart.categories || rows.map((r: any) => r.truckId)).map((id: string) => Number((cmpRowsByTruck.get(id) || {}).estimatedProfit || 0)) }] : []),
            ]}
          />
          <div className="table-wrap mt-4">
            <table>
              <thead>
                <tr>
                  <th>Truck</th>
                  <th>Revenue</th>
                  <th>Cost</th>
                  <th>Profit</th>
                  {isComparisonMode ? <th>Compared Profit</th> : null}
                  {isComparisonMode ? <th>Δ Profit</th> : null}
                  <th>Deadhead %</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any, i: number) => {
                  const cmpRow = cmpRowsByTruck.get(r.truckId) || {};
                  const delta = Number(r.estimatedProfit || 0) - Number(cmpRow.estimatedProfit || 0);
                  return (
                    <tr key={i} className={Number(r.estimatedProfit) >= 0 ? "bg-green-50" : "bg-red-50"}>
                      <td>{r.truckId}</td><td>{currency(r.revenue)}</td><td>{currency(r.totalCost)}</td>
                      <td>{currency(r.estimatedProfit)}</td>
                      {isComparisonMode ? <td>{currency(Number(cmpRow.estimatedProfit || 0))}</td> : null}
                      {isComparisonMode ? <td className={delta >= 0 ? "text-green-700" : "text-red-700"}>{currency(delta)}</td> : null}
                      <td>{num(r.deadheadPercentage, 1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4">
          <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={(comparisonMetrics as any)?.narrative} />
          <DataQualityBlock metrics={metrics} />
        </div>
      </section>
    );
  }

  if (section.sectionKey === "LANE_PERFORMANCE") {
    const cmpRowsByLane = new Map((((comparisonSection?.metricsJson?.rows || []) as any[])).map((r) => [r.lane, r]));

    return (
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card">
            <BarChart
              categories={chart.categories || rows.map((r: any) => r.lane)}
              series={[
                { name: "This Week", data: chart.values || rows.map((r: any) => Number(r.laneProfitPerMile || r.averageProfitPerMile || 0)) },
                ...(isComparisonMode ? [{ name: "Compared Week", data: (chart.categories || rows.map((r: any) => r.lane)).map((lane: string) => Number((cmpRowsByLane.get(lane) || {}).laneProfitPerMile || (cmpRowsByLane.get(lane) || {}).averageProfitPerMile || 0)) }] : []),
              ]}
            />
          </div>
          <div className="card">
            <HeatmapTable rows={chart.heatRows || rows.map((r: any) => ({ lane: r.lane, score: r.laneProfitPerMile || r.averageProfitPerMile, recommendation: r.recommendation }))} labelKey="lane" scoreKey="score" />
            {isComparisonMode ? (
              <div className="table-wrap mt-4">
                <table>
                  <thead><tr><th>Lane</th><th>Profit/Mile</th><th>Compared</th><th>Δ</th></tr></thead>
                  <tbody>
                    {rows.map((r: any, i: number) => {
                      const current = Number(r.laneProfitPerMile || r.averageProfitPerMile || 0);
                      const compared = Number((cmpRowsByLane.get(r.lane) || {}).laneProfitPerMile || (cmpRowsByLane.get(r.lane) || {}).averageProfitPerMile || 0);
                      const delta = current - compared;
                      return (
                        <tr key={i}>
                          <td>{r.lane}</td>
                          <td>{num(current, 3)}</td>
                          <td>{num(compared, 3)}</td>
                          <td className={delta >= 0 ? "text-green-700" : "text-red-700"}>{num(delta, 3)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
        <div className="space-y-4">
          <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={(comparisonMetrics as any)?.narrative} />
          <DataQualityBlock metrics={metrics} />
        </div>
      </section>
    );
  }

  if (section.sectionKey === "DRIVER_PERFORMANCE") {
    const categories = chart.categories || rows.map((d: any) => d.driverId);
    const cmpRowsByDriver = new Map((((comparisonSection?.metricsJson?.rows || []) as any[])).map((r) => [r.driverId, r]));

    return (
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <BarChart
            categories={categories}
            series={[
              { name: "This Week", data: chart.scoreValues || rows.map((d: any) => Number(d.driverEfficiencyScore || d.driverScore || 0)) },
              ...(isComparisonMode ? [{ name: "Compared Week", data: categories.map((id: string) => Number((cmpRowsByDriver.get(id) || {}).driverEfficiencyScore || (cmpRowsByDriver.get(id) || {}).driverScore || 0)) }] : []),
            ]}
          />
          <RadarChart indicators={["Profit/Mile", "Loaded %", "Fuel", "On-time", "Idle"]} values={[68, 74, 62, 70, 61]} name="Driver Profile (Fleet Avg)" />
          <div className="table-wrap mt-4">
            <table>
              <thead>
                <tr>
                  <th>Driver</th><th>Revenue</th><th>Profit</th><th>Profit/Mile</th>
                  {isComparisonMode ? <th>Compared P/Mile</th> : null}
                  {isComparisonMode ? <th>Δ P/Mile</th> : null}
                  <th>Loaded %</th><th>Rev/Loaded Mile</th><th>Idle Cost</th><th>Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d: any, i: number) => {
                  const cmpRow = cmpRowsByDriver.get(d.driverId) || {};
                  const current = Number(d.profitPerMile || 0);
                  const compared = Number(cmpRow.profitPerMile || 0);
                  const delta = current - compared;
                  return (
                    <tr key={i}>
                      <td>{d.driverId}</td>
                      <td>{currency(d.totalRevenue)}</td>
                      <td>{currency(d.profitContribution)}</td>
                      <td>{num(current, 3)}</td>
                      {isComparisonMode ? <td>{num(compared, 3)}</td> : null}
                      {isComparisonMode ? <td className={delta >= 0 ? "text-green-700" : "text-red-700"}>{num(delta, 3)}</td> : null}
                      <td>{num(d.loadedMilesPct, 1)}%</td>
                      <td>{num(d.revenuePerLoadedMile, 3)}</td>
                      <td>{currency(d.idleCostEstimate)}</td>
                      <td>{d.driverEfficiencyScore ?? d.driverScore}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4">
          <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={(comparisonMetrics as any)?.narrative} />
          <DataQualityBlock metrics={metrics} />
        </div>
      </section>
    );
  }

  if (section.sectionKey === "COST_TRENDS") {
    const maintenanceBars = chart.maintenanceBars || [];
    const labels = maintenanceBars.map((x: any) => x.truckId);
    const values = maintenanceBars.map((x: any) => x.cost);
    const cmpMaint = ((comparisonSection?.chartDataJson?.maintenanceBars || []) as any[]);
    const cmpBreakdown = ((comparisonSection?.chartDataJson?.costBreakdown || []) as any[]);

    return (
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Total Operating Cost"
              value={currency(summary.totalOperatingCost || (summary.fixedCosts + summary.variableCosts))}
              compare={isComparisonMode ? { comparedValue: currency(cmpSummary.totalOperatingCost || (cmpSummary.fixedCosts + cmpSummary.variableCosts)), pctDelta: pctDelta(Number(summary.totalOperatingCost || (summary.fixedCosts + summary.variableCosts)), Number(cmpSummary.totalOperatingCost || (cmpSummary.fixedCosts + cmpSummary.variableCosts))) } : undefined}
            />
            <KpiCard
              label="Cost / Total Mile"
              value={num(summary.costPerTotalMile || summary.costPerMile, 3)}
              compare={isComparisonMode ? { comparedValue: num(cmpSummary.costPerTotalMile || cmpSummary.costPerMile || 0, 3), pctDelta: pctDelta(Number(summary.costPerTotalMile || summary.costPerMile || 0), Number(cmpSummary.costPerTotalMile || cmpSummary.costPerMile || 0)) } : undefined}
            />
            <KpiCard
              label="Cost / Loaded Mile"
              value={num(summary.costPerLoadedMile || 0, 3)}
              compare={isComparisonMode ? { comparedValue: num(cmpSummary.costPerLoadedMile || 0, 3), pctDelta: pctDelta(Number(summary.costPerLoadedMile || 0), Number(cmpSummary.costPerLoadedMile || 0)) } : undefined}
            />
            <KpiCard
              label="Fuel % Revenue"
              value={`${num(summary.fuelPctOfRevenue || 0, 1)}%`}
              compare={isComparisonMode ? { comparedValue: `${num(cmpSummary.fuelPctOfRevenue || 0, 1)}%`, pctDelta: pctDelta(Number(summary.fuelPctOfRevenue || 0), Number(cmpSummary.fuelPctOfRevenue || 0)) } : undefined}
            />
          </div>
          <div className="card">
            <BarChart
              categories={labels}
              series={[
                { name: "This Week", data: values },
                ...(isComparisonMode ? [{ name: "Compared Week", data: labels.map((label: string) => Number((cmpMaint.find((x: any) => x.truckId === label) || {}).cost || 0)) }] : []),
              ]}
            />
          </div>
          <div className="card">
            <BarChart
              categories={(chart.costBreakdown || []).map((x: any) => x.name)}
              series={[
                { name: "This Week Costs", data: (chart.costBreakdown || []).map((x: any) => Number(x.value || 0)) },
                ...(isComparisonMode ? [{ name: "Compared Week Costs", data: (chart.costBreakdown || []).map((x: any) => Number((cmpBreakdown.find((y) => y.name === x.name) || {}).value || 0)) }] : []),
              ]}
            />
          </div>
        </div>
        <div className="space-y-4">
          <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={(comparisonMetrics as any)?.narrative} />
          <DataQualityBlock metrics={metrics} />
          {summary.anomalyFlags?.length ? (
            <div className="card">
              <p className="mb-2 text-sm font-semibold">Anomaly Flags</p>
              <div className="flex flex-wrap gap-2">
                {summary.anomalyFlags.map((f: string) => (
                  <span key={f} className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">{f}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return <div className="card">Unknown section</div>;
}

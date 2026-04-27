"use client";

import { useState } from "react";
import { BarChart } from "@/components/charts/BarChart";
import { HeatmapTable } from "@/components/charts/HeatmapTable";
import { KpiCard } from "@/components/charts/KpiCard";
import { LineChart } from "@/components/charts/LineChart";
import { RadarChart } from "@/components/charts/RadarChart";
import { NarrativeCard } from "@/components/dashboard/NarrativeCard";
import { DashboardSectionCard } from "@/components/dashboard/DashboardSectionCard";
import { SECTION_LABELS, UI_COPY } from "@/lib/labels";
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

function deltaTextClass(value: number, lowerIsBetter = false) {
  if (Math.abs(value) < 0.000001) return "text-slate-600";
  if (lowerIsBetter) return value < 0 ? "text-emerald-700" : "text-red-700";
  return value > 0 ? "text-emerald-700" : "text-red-700";
}

function DataQualityBlock({ metrics }: { metrics: any }) {
  const dq = metrics?.dataQuality;
  if (!dq) return null;
  return (
    <div className="card text-xs text-slate-700">
      <p className="font-semibold">Data quality score: {dq.confidenceScore}/100</p>
      {dq.estimatedFields?.length ? <p>Estimated fields: {dq.estimatedFields.join(", ")}</p> : null}
      {dq.missingFiles?.length ? <p>Missing files: {dq.missingFiles.join(", ")}</p> : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const cls =
    normalized.includes("good") || normalized.includes("strong") || normalized.includes("improved")
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : normalized.includes("watch") || normalized.includes("review") || normalized.includes("renegotiate")
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : normalized.includes("avoid") || normalized.includes("needs")
          ? "text-red-700 bg-red-50 border-red-200"
          : "text-slate-600 bg-slate-50 border-slate-200";

  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>;
}

function EmptySection() {
  return (
    <div className="card text-sm text-slate-600">
      <p>{UI_COPY.noDataSection}</p>
      <p>{UI_COPY.noDataSectionHint}</p>
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
  const [expanded, setExpanded] = useState(false);
  const meta = SECTION_LABELS[section.sectionKey] || { title: section.title, description: "" };
  const metrics = section.metricsJson || {};
  const summary = metrics.summary || metrics;
  const rows = metrics.rows || section.chartDataJson?.tableRows || [];
  const chart = section.chartDataJson || {};
  const cmpSummary = comparisonSection ? (comparisonSection.metricsJson?.summary || comparisonSection.metricsJson || {}) : {};

  if (section.sectionKey === "EXECUTIVE_OVERVIEW") {
    return (
      <DashboardSectionCard title={meta.title} description={meta.description}>
        <div className="grid gap-4 lg:grid-cols-3">
          <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={comparisonSection?.narrativeJson as any} />
          <div className="card lg:col-span-2">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Revenue" value={currency(summary.totalRevenue)} compare={isComparisonMode ? { comparedValue: currency(cmpSummary.totalRevenue || 0), pctDelta: pctDelta(Number(summary.totalRevenue || 0), Number(cmpSummary.totalRevenue || 0)) } : undefined} />
              <KpiCard label="Estimated Profit" value={currency(summary.estimatedProfit)} compare={isComparisonMode ? { comparedValue: currency(cmpSummary.estimatedProfit || 0), pctDelta: pctDelta(Number(summary.estimatedProfit || 0), Number(cmpSummary.estimatedProfit || 0)) } : undefined} />
              <KpiCard label="Profit / Mile" value={num(summary.profitPerMile, 3)} compare={isComparisonMode ? { comparedValue: num(cmpSummary.profitPerMile || 0, 3), pctDelta: pctDelta(Number(summary.profitPerMile || 0), Number(cmpSummary.profitPerMile || 0)) } : undefined} />
              <KpiCard label="Miles Run" value={num(summary.totalLoadedMiles || summary.totalMiles, 0)} compare={isComparisonMode ? { comparedValue: num(cmpSummary.totalLoadedMiles || cmpSummary.totalMiles || 0, 0), pctDelta: pctDelta(Number(summary.totalLoadedMiles || summary.totalMiles || 0), Number(cmpSummary.totalLoadedMiles || cmpSummary.totalMiles || 0)) } : undefined} />
            </div>
          </div>
        </div>
        <DataQualityBlock metrics={metrics} />
      </DashboardSectionCard>
    );
  }

  if (section.sectionKey === "TRUCK_PROFITABILITY") {
    const visibleRows = rows.slice(0, 5);
    const allRows = rows;
    const cmpRowsByTruck = new Map((((comparisonSection?.chartDataJson?.tableRows || []) as any[])).map((r) => [r.truckId, r]));

    const renderTable = (tableRows: any[]) => (
      <div className="table-wrap mt-4">
        <table>
          <caption className="sr-only">Top trucks by estimated profit for selected week</caption>
          <thead><tr><th scope="col">Truck</th><th scope="col">Revenue</th><th scope="col">Estimated Profit</th>{isComparisonMode ? <th className="text-orange-700" scope="col">Compared Profit</th> : null}{isComparisonMode ? <th scope="col">Change</th> : null}<th scope="col">Status</th></tr></thead>
          <tbody>
            {tableRows.map((r: any, i: number) => {
              const comparedProfit = Number((cmpRowsByTruck.get(r.truckId) || {}).estimatedProfit || 0);
              const delta = Number(r.estimatedProfit || 0) - comparedProfit;
              const status = Number(r.estimatedProfit || 0) > 0 ? (Number(r.profitPerMile || 0) > 1 ? "Good" : "Watch") : "Needs Review";
              return (
                <tr key={i}>
                  <td>{r.truckId}</td>
                  <td>{currency(r.revenue)}</td>
                  <td>{currency(r.estimatedProfit)}</td>
                  {isComparisonMode ? <td className="text-orange-700">{currency(comparedProfit)}</td> : null}
                  {isComparisonMode ? <td className={deltaTextClass(delta)}>{currency(delta)}</td> : null}
                  <td><StatusBadge status={status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

    return (
      <DashboardSectionCard title={meta.title} description={meta.description}>
        {!rows.length ? <EmptySection /> : null}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <div role="img" aria-label="Estimated profit by truck for selected week and optional compared week">
              <BarChart
                categories={(chart.categories || visibleRows.map((r: any) => r.truckId)).slice(0, 8)}
                series={[
                  { name: "This Week", data: (chart.values || visibleRows.map((r: any) => Number(r.estimatedProfit || 0))).slice(0, 8) },
                  ...(isComparisonMode ? [{ name: "Compared Week", data: (chart.categories || visibleRows.map((r: any) => r.truckId)).slice(0, 8).map((id: string) => Number((cmpRowsByTruck.get(id) || {}).estimatedProfit || 0)) }] : []),
                ]}
              />
            </div>
            {renderTable(expanded ? allRows : visibleRows)}
            {allRows.length > 5 ? (
              <div className="mt-3">
                <button
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={() => setExpanded((v) => !v)}
                  type="button"
                >
                  {expanded ? "Collapse" : "Expand"}
                </button>
              </div>
            ) : null}
          </div>
          <div className="space-y-4">
            <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={comparisonSection?.narrativeJson as any} />
            <DataQualityBlock metrics={metrics} />
          </div>
        </div>
      </DashboardSectionCard>
    );
  }

  if (section.sectionKey === "LANE_PERFORMANCE") {
    const visibleRows = rows.slice(0, 5);
    const allRows = rows;
    const cmpRowsByLane = new Map((((comparisonSection?.metricsJson?.rows || []) as any[])).map((r) => [r.lane, r]));

    const renderTable = (tableRows: any[]) => (
      <div className="table-wrap mt-4">
        <table>
          <caption className="sr-only">Top lanes for selected week</caption>
          <thead><tr><th scope="col">Lane</th><th scope="col">Loads</th><th scope="col">Revenue</th><th scope="col">Rate / Mile</th>{isComparisonMode ? <th className="text-orange-700" scope="col">Compared Rate</th> : null}{isComparisonMode ? <th scope="col">Change</th> : null}<th scope="col">Status</th></tr></thead>
          <tbody>
            {tableRows.map((r: any, i: number) => {
              const rate = Number(r.laneRevenuePerLoadedMile || r.averageRatePerMile || 0);
              const prevRate = Number((cmpRowsByLane.get(r.lane) || {}).laneRevenuePerLoadedMile || (cmpRowsByLane.get(r.lane) || {}).averageRatePerMile || 0);
              const change = rate - prevRate;
              const status = rate > 2.6 ? "Strong" : rate > 2.2 ? "Okay" : rate > 1.9 ? "Renegotiate" : "Avoid";
              return (
                <tr key={i}>
                  <td>{r.lane}</td>
                  <td>{r.loads ?? "-"}</td>
                  <td>{currency(r.revenue)}</td>
                  <td>{num(rate, 2)}</td>
                  {isComparisonMode ? <td className="text-orange-700">{num(prevRate, 2)}</td> : null}
                  {isComparisonMode ? <td className={deltaTextClass(change)}>{num(change, 2)}</td> : null}
                  <td><StatusBadge status={status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

    return (
      <DashboardSectionCard title={meta.title} description={meta.description}>
        {!rows.length ? <EmptySection /> : null}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="card">
              <div role="img" aria-label="Rate per mile by lane for selected week and optional compared week">
                <BarChart
                  categories={(chart.categories || visibleRows.map((r: any) => r.lane)).slice(0, 8)}
                  series={[
                    { name: "This Week", data: (chart.values || visibleRows.map((r: any) => Number(r.laneRevenuePerLoadedMile || r.averageRatePerMile || 0))).slice(0, 8) },
                    ...(isComparisonMode ? [{ name: "Compared Week", data: (chart.categories || visibleRows.map((r: any) => r.lane)).slice(0, 8).map((lane: string) => Number((cmpRowsByLane.get(lane) || {}).laneRevenuePerLoadedMile || (cmpRowsByLane.get(lane) || {}).averageRatePerMile || 0)) }] : []),
                  ]}
                />
              </div>
            </div>
            <div className="card">
              <div role="img" aria-label="Lane performance heat table for selected week">
                <HeatmapTable rows={chart.heatRows || visibleRows.map((r: any) => ({ lane: r.lane, score: r.laneProfitPerMile || r.averageProfitPerMile, recommendation: r.recommendation }))} labelKey="lane" scoreKey="score" />
              </div>
              {renderTable(expanded ? allRows : visibleRows)}
              {allRows.length > 5 ? (
                <div className="mt-3">
                  <button
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => setExpanded((v) => !v)}
                    type="button"
                  >
                    {expanded ? "Collapse" : "Expand"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <div className="space-y-4">
            <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={comparisonSection?.narrativeJson as any} />
            <DataQualityBlock metrics={metrics} />
          </div>
        </div>
      </DashboardSectionCard>
    );
  }

  if (section.sectionKey === "DRIVER_PERFORMANCE") {
    const visibleRows = rows.slice(0, 5);
    const allRows = rows;
    const categories = chart.categories || visibleRows.map((d: any) => d.driverId);
    const cmpRowsByDriver = new Map((((comparisonSection?.metricsJson?.rows || []) as any[])).map((r) => [r.driverId, r]));

    const renderTable = (tableRows: any[]) => (
      <div className="table-wrap mt-4">
        <table>
          <caption className="sr-only">Top drivers for selected week</caption>
          <thead><tr><th scope="col">Driver</th><th scope="col">Loads</th><th scope="col">Miles</th><th scope="col">Revenue</th>{isComparisonMode ? <th className="text-orange-700" scope="col">Compared Revenue</th> : null}{isComparisonMode ? <th scope="col">Change</th> : null}<th scope="col">Status</th></tr></thead>
          <tbody>
            {tableRows.map((d: any, i: number) => {
              const current = Number(d.totalRevenue || 0);
              const compared = Number((cmpRowsByDriver.get(d.driverId) || {}).totalRevenue || 0);
              const delta = current - compared;
              const status = (d.driverEfficiencyScore ?? 0) >= 80 ? "Good" : (d.driverEfficiencyScore ?? 0) >= 65 ? "Watch" : "Needs Review";
              return (
                <tr key={i}>
                  <td>{d.driverId}</td>
                  <td>{d.loadsCompleted ?? "-"}</td>
                  <td>{num(d.totalMiles, 0)}</td>
                  <td>{currency(current)}</td>
                  {isComparisonMode ? <td className="text-orange-700">{currency(compared)}</td> : null}
                  {isComparisonMode ? <td className={deltaTextClass(delta)}>{currency(delta)}</td> : null}
                  <td><StatusBadge status={status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

    return (
      <DashboardSectionCard title={meta.title} description={meta.description}>
        {!rows.length ? <EmptySection /> : null}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <div role="img" aria-label="Driver performance score chart for selected week and optional compared week">
              <BarChart
                categories={categories}
                series={[
                  { name: "This Week", data: (chart.scoreValues || visibleRows.map((d: any) => Number(d.driverEfficiencyScore || d.driverScore || 0))).slice(0, 8) },
                  ...(isComparisonMode ? [{ name: "Compared Week", data: categories.slice(0, 8).map((id: string) => Number((cmpRowsByDriver.get(id) || {}).driverEfficiencyScore || (cmpRowsByDriver.get(id) || {}).driverScore || 0)) }] : []),
                ]}
              />
            </div>
            <div role="img" aria-label="Driver profile radar chart">
              <RadarChart indicators={["Profit/Mile", "Loaded %", "Fuel", "On-time", "Idle"]} values={[68, 74, 62, 70, 61]} name="Driver Profile" />
            </div>
            {renderTable(expanded ? allRows : visibleRows)}
            {allRows.length > 5 ? (
              <div className="mt-3">
                <button
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={() => setExpanded((v) => !v)}
                  type="button"
                >
                  {expanded ? "Collapse" : "Expand"}
                </button>
              </div>
            ) : null}
          </div>
          <div className="space-y-4">
            <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={comparisonSection?.narrativeJson as any} />
            <DataQualityBlock metrics={metrics} />
          </div>
        </div>
      </DashboardSectionCard>
    );
  }

  if (section.sectionKey === "COST_TRENDS") {
    const summaryRows = [
      { category: "Fuel", amount: Number(summary.fuelCost || summary.fuelCostTotal || 0) },
      { category: "Maintenance", amount: Number(summary.maintenanceCost || summary.maintenanceCostTotal || 0) },
      { category: "Driver Pay", amount: Number(summary.driverPay || 0) },
      { category: "Other", amount: Number(summary.fixedCosts || 0) },
    ];
    const total = summaryRows.reduce((acc, r) => acc + r.amount, 0);
    const visibleRows = summaryRows.slice(0, 5);
    const cmpBreakdown = ((comparisonSection?.chartDataJson?.costBreakdown || []) as any[]);

    const renderTable = (tableRows: typeof summaryRows) => (
      <div className="table-wrap mt-4">
        <table>
          <caption className="sr-only">Top cost categories for selected week</caption>
          <thead><tr><th scope="col">Cost</th><th scope="col">Amount</th><th scope="col">Share</th>{isComparisonMode ? <th className="text-orange-700" scope="col">Compared Amount</th> : null}{isComparisonMode ? <th scope="col">Change</th> : null}<th scope="col">Status</th></tr></thead>
          <tbody>
            {tableRows.map((r, i) => {
              const compared = Number((cmpBreakdown.find((x) => x.name === r.category) || {}).value || 0);
              const change = r.amount - compared;
              const share = total ? (r.amount / total) * 100 : 0;
              const status = share > 40 ? "Needs Review" : share > 25 ? "Watch" : "Good";
              return (
                <tr key={i}>
                  <td>{r.category}</td>
                  <td>{currency(r.amount)}</td>
                  <td>{num(share, 1)}%</td>
                  {isComparisonMode ? <td className="text-orange-700">{currency(compared)}</td> : null}
                  {isComparisonMode ? <td className={deltaTextClass(change, true)}>{currency(change)}</td> : null}
                  <td><StatusBadge status={status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

    const maintenanceBars = chart.maintenanceBars || [];
    const labels = maintenanceBars.map((x: any) => x.truckId);
    const values = maintenanceBars.map((x: any) => x.cost);
    const cmpMaint = ((comparisonSection?.chartDataJson?.maintenanceBars || []) as any[]);

    return (
      <DashboardSectionCard title={meta.title} description={meta.description}>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Fuel Cost" value={currency(summaryRows[0].amount)} />
              <KpiCard label="Maintenance Cost" value={currency(summaryRows[1].amount)} />
              <KpiCard label="Driver Pay" value={currency(summaryRows[2].amount)} />
              <KpiCard label="Cost / Mile" value={num(summary.costPerTotalMile || summary.costPerMile, 3)} />
            </div>
            <div className="card">
              <div role="img" aria-label="Maintenance cost by truck for selected week and optional compared week">
                <BarChart
                  categories={labels}
                  series={[
                    { name: "This Week", data: values },
                    ...(isComparisonMode ? [{ name: "Compared Week", data: labels.map((label: string) => Number((cmpMaint.find((x: any) => x.truckId === label) || {}).cost || 0)) }] : []),
                  ]}
                />
              </div>
            </div>
            <div className="card">
              {renderTable(expanded ? summaryRows : visibleRows)}
              {summaryRows.length > 5 ? (
                <div className="mt-3">
                  <button
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => setExpanded((v) => !v)}
                    type="button"
                  >
                    {expanded ? "Collapse" : "Expand"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <div className="space-y-4">
            <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={comparisonSection?.narrativeJson as any} />
            <DataQualityBlock metrics={metrics} />
            {summary.anomalyFlags?.length ? (
              <div className="card">
                <p className="mb-2 text-sm font-semibold">Something looks off</p>
                <div className="flex flex-wrap gap-2">
                  {summary.anomalyFlags.map((f: string) => (
                    <span key={f} className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">{f}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DashboardSectionCard>
    );
  }

  return (
    <DashboardSectionCard title={meta.title} description={meta.description}>
      <EmptySection />
    </DashboardSectionCard>
  );
}

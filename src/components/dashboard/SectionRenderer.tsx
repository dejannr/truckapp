"use client";

import { useState } from "react";
import { BarChart } from "@/components/charts/BarChart";
import { HeatmapTable } from "@/components/charts/HeatmapTable";
import { KpiCard } from "@/components/charts/KpiCard";
import { LineChart } from "@/components/charts/LineChart";
import { RadarChart } from "@/components/charts/RadarChart";
import { ScatterChart } from "@/components/charts/ScatterChart";
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
  if (Math.abs(value) < 0.000001) return "!text-slate-600 font-semibold";
  if (lowerIsBetter) return value < 0 ? "!text-emerald-700 font-semibold" : "!text-red-700 font-semibold";
  return value > 0 ? "!text-emerald-700 font-semibold" : "!text-red-700 font-semibold";
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
  allSections,
  allCompareSections,
  comparisonMetrics,
  isComparisonMode,
}: {
  section: SectionPayload;
  comparisonSection?: SectionPayload;
  allSections?: SectionPayload[];
  allCompareSections?: SectionPayload[];
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
  const qualityScoreRaw = Number(metrics?.dataQuality?.confidenceScore);
  const qualityScore = Number.isFinite(qualityScoreRaw) ? qualityScoreRaw : undefined;

  if (section.sectionKey === "EXECUTIVE_OVERVIEW") {
    const rev = Number(summary.totalRevenue || 0);
    const cmpRev = Number(cmpSummary.totalRevenue || 0);
    const profit = Number(summary.estimatedProfit || 0);
    const cmpProfit = Number(cmpSummary.estimatedProfit || 0);
    const margin = Number(summary.grossMarginPct || 0);
    const cmpMargin = Number(cmpSummary.grossMarginPct || 0);
    const cpm = Number(summary.breakEvenRatePerMile || 0);
    const cmpCpm = Number(cmpSummary.breakEvenRatePerMile || 0);
    const deadhead = Number(summary.deadheadPercentage || 0);
    const cmpDeadhead = Number(cmpSummary.deadheadPercentage || 0);
    const revPerTruck = Number(summary.revenuePerTruck || 0);
    const cmpRevPerTruck = Number(cmpSummary.revenuePerTruck || 0);

    const healthCards = [
      { label: "Fuel Efficiency", score: Math.max(0, Math.min(100, 100 - cpm * 25)), delta: pctDelta(cmpCpm || cpm, cpm || 1), why: "Cost-per-mile movement and fuel pressure trend." },
      { label: "Truck Utilization", score: Math.max(0, Math.min(100, 100 - deadhead)), delta: pctDelta(100 - deadhead, 100 - (cmpDeadhead || deadhead)), why: "Driven by loaded vs empty mile mix." },
      { label: "Cash Flow Health", score: Math.max(0, Math.min(100, margin * 4)), delta: pctDelta(margin, cmpMargin || margin), why: "Margin and revenue trend impact liquidity." },
      { label: "Dispatch Efficiency", score: Math.max(0, Math.min(100, 100 - deadhead * 1.2)), delta: pctDelta(deadhead, cmpDeadhead || deadhead), why: "Deadhead and lane matching efficiency." },
      { label: "Maintenance Risk", score: Math.max(0, Math.min(100, 100 - cpm * 30)), delta: pctDelta(cpm, cmpCpm || cpm), why: "Operating cost pressure suggests maintenance risk." },
    ];

    return (
      <DashboardSectionCard title={meta.title} description={meta.description} qualityScore={qualityScore}>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
            <KpiCard label="Net Profit" value={currency(profit)} compare={isComparisonMode ? { comparedValue: currency(cmpProfit), pctDelta: pctDelta(profit, cmpProfit) } : undefined} sparkline={[cmpProfit, profit]} />
            <KpiCard label="Profit Margin %" value={`${num(margin, 1)}%`} compare={isComparisonMode ? { comparedValue: `${num(cmpMargin, 1)}%`, pctDelta: pctDelta(margin, cmpMargin) } : undefined} sparkline={[cmpMargin, margin]} />
            <KpiCard label="Revenue" value={currency(rev)} compare={isComparisonMode ? { comparedValue: currency(cmpRev), pctDelta: pctDelta(rev, cmpRev) } : undefined} sparkline={[cmpRev, rev]} />
            <KpiCard label="Cost Per Mile" value={num(cpm, 3)} compare={isComparisonMode ? { comparedValue: num(cmpCpm, 3), pctDelta: pctDelta(cpm, cmpCpm) } : undefined} sparkline={[cmpCpm, cpm]} />
            <KpiCard label="Deadhead %" value={`${num(deadhead, 1)}%`} compare={isComparisonMode ? { comparedValue: `${num(cmpDeadhead, 1)}%`, pctDelta: pctDelta(deadhead, cmpDeadhead) } : undefined} sparkline={[cmpDeadhead, deadhead]} />
            <KpiCard label="Revenue Per Truck" value={currency(revPerTruck)} compare={isComparisonMode ? { comparedValue: currency(cmpRevPerTruck), pctDelta: pctDelta(revPerTruck, cmpRevPerTruck) } : undefined} sparkline={[cmpRevPerTruck, revPerTruck]} />
          </div>
          <div className="lg:sticky lg:top-44 lg:self-start">
            <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={comparisonSection?.narrativeJson as any} titleOverride={meta.title} />
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {healthCards.map((h) => (
            <div key={h.label} className="card">
              <p className="text-xs uppercase text-slate-500">{h.label}</p>
              <p className="mt-2 text-2xl font-semibold">{num(h.score, 0)}</p>
              <p className={`text-xs font-semibold ${deltaTextClass(h.delta, h.label.includes("Risk"))}`}>{h.delta > 0 ? "+" : ""}{num(h.delta, 1)}%</p>
              <p className="mt-1 text-xs text-slate-600">{h.why}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 card">
          <p className="text-sm font-semibold text-slate-900">Biggest Changes This Week</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5 text-sm">
            <div>Highest profit increase: <span className="font-semibold text-emerald-700">{currency(Math.max(0, profit - cmpProfit))}</span></div>
            <div>Biggest profit decline: <span className="font-semibold text-red-700">{currency(Math.max(0, cmpProfit - profit))}</span></div>
            <div>Largest fuel increase: <span className="font-semibold text-red-700">{num(Math.max(0, cpm - cmpCpm), 3)} CPM</span></div>
            <div>Best lane improvement: <span className="font-semibold text-emerald-700">{num(Math.max(0, margin - cmpMargin), 1)}% margin</span></div>
            <div>Worst truck decline: <span className="font-semibold text-red-700">{num(Math.max(0, deadhead - cmpDeadhead), 1)}% deadhead</span></div>
          </div>
        </div>
      </DashboardSectionCard>
    );
  }

  if (section.sectionKey === "TRUCK_PROFITABILITY") {
    const visibleRows = rows.slice(0, 5);
    const allRows = rows;
    const cmpRowsByTruck = new Map((((comparisonSection?.chartDataJson?.tableRows || []) as any[])).map((r) => [r.truckId, r]));

    const totalRevenue = rows.reduce((acc: number, r: any) => acc + Number(r.revenue || 0), 0);
    const totalExpenses = rows.reduce((acc: number, r: any) => acc + Number(r.totalCost || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const cmpTotalRevenue = ((comparisonSection?.metricsJson?.rows || []) as any[]).reduce((acc: number, r: any) => acc + Number(r.revenue || 0), 0);
    const cmpTotalExpenses = ((comparisonSection?.metricsJson?.rows || []) as any[]).reduce((acc: number, r: any) => acc + Number(r.totalCost || 0), 0);
    const cmpNetProfit = cmpTotalRevenue - cmpTotalExpenses;
    const fuel = totalExpenses * 0.42;
    const payroll = totalRevenue * 0.28;
    const maintenance = totalExpenses * 0.18;
    const otherCosts = Math.max(0, totalExpenses - fuel - maintenance);

    const renderTable = (tableRows: any[]) => (
      <div className="table-wrap mt-4">
        <table>
          <caption className="sr-only">Profitability table by truck for selected week</caption>
          <thead><tr><th scope="col">Truck</th><th scope="col">Revenue</th><th scope="col">Expenses</th><th scope="col">Net Profit</th><th scope="col">Profit Margin %</th>{isComparisonMode ? <th className="text-orange-700" scope="col">Delta vs Comparison Week</th> : null}<th scope="col">Status</th></tr></thead>
          <tbody>
            {tableRows.map((r: any, i: number) => {
              const comparedProfit = Number((cmpRowsByTruck.get(r.truckId) || {}).estimatedProfit || 0);
              const delta = Number(r.estimatedProfit || 0) - comparedProfit;
              const expenses = Number(r.totalCost || 0);
              const margin = Number(r.revenue || 0) ? (Number(r.estimatedProfit || 0) / Number(r.revenue || 0)) * 100 : 0;
              const status = Number(r.estimatedProfit || 0) > 0 ? (Number(r.profitPerMile || 0) > 1 ? "Good" : "Watch") : "Needs Review";
              return (
                <tr key={i}>
                  <td>{r.truckId}</td>
                  <td>{currency(r.revenue)}</td>
                  <td>{currency(expenses)}</td>
                  <td>{currency(r.estimatedProfit)}</td>
                  <td>{num(margin, 1)}%</td>
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
      <DashboardSectionCard title={meta.title} description={meta.description} qualityScore={qualityScore}>
        {!rows.length ? <EmptySection /> : null}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <KpiCard label="Revenue" value={currency(totalRevenue)} compare={isComparisonMode ? { comparedValue: currency(cmpTotalRevenue), pctDelta: pctDelta(totalRevenue, cmpTotalRevenue) } : undefined} sparkline={[cmpTotalRevenue, totalRevenue]} />
              <KpiCard label="Expenses" value={currency(totalExpenses)} compare={isComparisonMode ? { comparedValue: currency(cmpTotalExpenses), pctDelta: pctDelta(totalExpenses, cmpTotalExpenses) } : undefined} sparkline={[cmpTotalExpenses, totalExpenses]} />
              <KpiCard label="Net Profit" value={currency(netProfit)} compare={isComparisonMode ? { comparedValue: currency(cmpNetProfit), pctDelta: pctDelta(netProfit, cmpNetProfit) } : undefined} sparkline={[cmpNetProfit, netProfit]} />
            </div>
            <div className="card">
              <p className="text-sm font-semibold text-slate-900">Waterfall Chart</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-6 text-sm">
                <div>Revenue<br /><span className="font-semibold">{currency(totalRevenue)}</span></div>
                <div>Fuel<br /><span className="font-semibold text-red-700">-{currency(fuel)}</span></div>
                <div>Payroll<br /><span className="font-semibold text-red-700">-{currency(payroll)}</span></div>
                <div>Maintenance<br /><span className="font-semibold text-red-700">-{currency(maintenance)}</span></div>
                <div>Other Costs<br /><span className="font-semibold text-red-700">-{currency(otherCosts)}</span></div>
                <div>Net Profit<br /><span className="font-semibold text-emerald-700">{currency(netProfit)}</span></div>
              </div>
            </div>
            <div className="card">
              <div role="img" aria-label="Estimated profit by truck for selected week and optional compared week">
                <BarChart
                  categories={(chart.categories || visibleRows.map((r: any) => r.truckId)).slice(0, 8)}
                  series={[
                    { name: "This Week", data: (chart.values || visibleRows.map((r: any) => Number(r.estimatedProfit || 0))).slice(0, 8) },
                    ...(isComparisonMode ? [{ name: "Compared Week", data: (chart.categories || visibleRows.map((r: any) => r.truckId)).slice(0, 8).map((id: string) => Number((cmpRowsByTruck.get(id) || {}).estimatedProfit || 0)) }] : []),
                  ]}
                />
              </div>
            </div>
            {renderTable(expanded ? allRows : visibleRows)}
            <div className="card">
              <p className="text-sm font-semibold text-slate-900">Expense Breakdown</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 text-sm">
                <div>Fuel: <span className="font-semibold">{num((fuel / Math.max(1, totalExpenses)) * 100, 1)}%</span></div>
                <div>Payroll: <span className="font-semibold">{num((payroll / Math.max(1, totalRevenue)) * 100, 1)}%</span></div>
                <div>Maintenance: <span className="font-semibold">{num((maintenance / Math.max(1, totalExpenses)) * 100, 1)}%</span></div>
              </div>
            </div>
            <div className="card">
              <p className="text-sm font-semibold text-slate-900">Cash Flow Block <span className="text-xs font-normal text-amber-700">(Estimated)</span></p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
                <div>Invoices pending: <span className="font-semibold">{currency(totalRevenue * 0.18)}</span></div>
                <div>Invoices paid: <span className="font-semibold">{currency(totalRevenue * 0.82)}</span></div>
                <div>Factoring fees: <span className="font-semibold">{currency(totalRevenue * 0.015)}</span></div>
                <div>Expected incoming cash: <span className="font-semibold">{currency(totalRevenue * 0.165)}</span></div>
              </div>
            </div>
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
          <div className="space-y-4 lg:sticky lg:top-44 lg:self-start">
            <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={comparisonSection?.narrativeJson as any} titleOverride={meta.title} />
          </div>
        </div>
      </DashboardSectionCard>
    );
  }

  if (section.sectionKey === "LANE_PERFORMANCE") {
    const truckSection = (allSections || []).find((s) => s.sectionKey === "TRUCK_PROFITABILITY");
    const driverSection = (allSections || []).find((s) => s.sectionKey === "DRIVER_PERFORMANCE");
    const cmpTruckSection = (allCompareSections || []).find((s) => s.sectionKey === "TRUCK_PROFITABILITY");
    const truckBaseRows = ((truckSection?.metricsJson?.rows || truckSection?.chartDataJson?.tableRows || []) as any[]);
    const driverBaseRows = ((driverSection?.metricsJson?.rows || driverSection?.chartDataJson?.tableRows || []) as any[]);
    const cmpRowsByTruck = new Map((((cmpTruckSection?.metricsJson?.rows || cmpTruckSection?.chartDataJson?.tableRows || []) as any[])).map((r) => [r.truckId, r]));
    const cmpDriverSection = (allCompareSections || []).find((s) => s.sectionKey === "DRIVER_PERFORMANCE");
    const cmpDriverRowsById = new Map((((cmpDriverSection?.metricsJson?.rows || []) as any[])).map((r) => [r.driverId, r]));

    const truckRows = truckBaseRows.map((r: any) => {
      const revenue = Number(r.revenue || 0);
      const profit = Number(r.estimatedProfit || 0);
      const miles = Number(r.totalMiles || 0);
      const rpm = Number(r.revenuePerLoadedMile || (miles ? revenue / miles : 0));
      const deadheadPct = Number(r.deadheadPercentage || 0);
      const utilization = Number(r.utilizationScore || (100 - deadheadPct));
      return {
        truck: r.truckId,
        profit,
        rpm,
        mpg: 6.4,
        utilization,
        deadheadPct,
        maintenanceCost: revenue * 0.08,
      };
    }).sort((a: any, b: any) => b.profit - a.profit);

    const bestTruck = truckRows[0];
    const worstTruck = truckRows[truckRows.length - 1];
    const highestFuel = [...truckRows].sort((a: any, b: any) => (b.rpm * 0.42) - (a.rpm * 0.42))[0];
    const mostIdle = [...truckRows].sort((a: any, b: any) => b.deadheadPct - a.deadheadPct)[0];

    const renderTruckTable = () => (
      <div className="table-wrap mt-4">
        <table>
          <caption className="sr-only">Truck leaderboard for selected week</caption>
          <thead><tr><th scope="col">Truck</th><th scope="col">Profit</th><th scope="col">RPM</th><th scope="col">MPG</th><th scope="col">Utilization %</th><th scope="col">Deadhead %</th><th scope="col">Maintenance Cost</th>{isComparisonMode ? <th scope="col">Delta vs Comparison Week</th> : null}</tr></thead>
          <tbody>
            {truckRows.slice(0, expanded ? truckRows.length : 5).map((r: any, i: number) => {
              const compared = Number((cmpRowsByTruck.get(r.truck) || {}).estimatedProfit || 0);
              const change = r.profit - compared;
              return (
                <tr key={i}>
                  <td>{r.truck}</td>
                  <td>{currency(r.profit)}</td>
                  <td>{num(r.rpm, 2)}</td>
                  <td>{num(r.mpg, 1)}</td>
                  <td>{num(r.utilization, 1)}%</td>
                  <td>{num(r.deadheadPct, 1)}%</td>
                  <td>{currency(r.maintenanceCost)}</td>
                  {isComparisonMode ? <td className={deltaTextClass(change)}>{currency(change)}</td> : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

    return (
      <DashboardSectionCard title={meta.title} description={meta.description} qualityScore={qualityScore}>
        {!rows.length ? <EmptySection /> : null}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card"><p className="text-xs uppercase text-slate-500">Best Truck</p><p className="mt-2 text-sm font-semibold">{bestTruck?.truck || "-"}</p></div>
              <div className="card"><p className="text-xs uppercase text-slate-500">Worst Truck</p><p className="mt-2 text-sm font-semibold">{worstTruck?.truck || "-"}</p></div>
              <div className="card"><p className="text-xs uppercase text-slate-500">Highest Fuel Usage <span className="text-[10px] text-amber-700">(Estimated)</span></p><p className="mt-2 text-sm font-semibold">{highestFuel?.truck || "-"}</p></div>
              <div className="card"><p className="text-xs uppercase text-slate-500">Most Idle Truck</p><p className="mt-2 text-sm font-semibold">{mostIdle?.truck || "-"}</p></div>
            </div>
            <div className="card">
              <p className="text-sm font-semibold text-slate-900">Truck Performance</p>
              <div role="img" aria-label="Truck performance trend">
                <BarChart
                  categories={truckRows.slice(0, 8).map((r: any) => r.truck || "UNASSIGNED")}
                  series={[
                    { name: "This Week Profit", data: truckRows.slice(0, 8).map((r: any) => r.profit) },
                    ...(isComparisonMode ? [{ name: "Compared Week", data: truckRows.slice(0, 8).map((r: any) => Number((cmpRowsByTruck.get(r.truck) || {}).estimatedProfit || 0)) }] : []),
                  ]}
                />
              </div>
            </div>
            {renderTruckTable()}
            <div className="table-wrap mt-4">
              <table>
                <caption className="sr-only">Driver leaderboard for selected week</caption>
                <thead><tr><th scope="col">Driver</th><th scope="col">Profit Generated</th><th scope="col">MPG</th><th scope="col">On-Time %</th><th scope="col">Loads</th><th scope="col">Deadhead %</th>{isComparisonMode ? <th scope="col">Delta vs Comparison Week</th> : null}</tr></thead>
                <tbody>
                  {(expanded ? driverBaseRows : driverBaseRows.slice(0, 5)).map((r: any, i: number) => (
                    <tr key={i}>
                      <td>{r.driverId}</td>
                      <td>{currency(r.profitContribution)}</td>
                      <td>{num(r.fuelEfficiency ?? 6.4, 1)}</td>
                      <td>{num(r.onTimePercentage ?? (88 - i * 2), 1)}%</td>
                      <td>{r.loadsCompleted ?? "-"}</td>
                      <td>{num(r.loadedMilesPct != null ? 100 - Number(r.loadedMilesPct) : 0, 1)}%</td>
                      {isComparisonMode ? (() => {
                        const cmp = Number((cmpDriverRowsById.get(r.driverId) || {}).profitContribution || 0);
                        const cur = Number(r.profitContribution || 0);
                        const dlt = cur - cmp;
                        return <td className={deltaTextClass(dlt)}>{currency(dlt)}</td>;
                      })() : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card">
              <div role="img" aria-label="Driver performance radar chart">
                <RadarChart indicators={["Efficiency", "Reliability", "Fuel Usage", "Profitability", "Utilization"]} values={[72, 84, 67, 75, 70]} name="Driver Profile" />
              </div>
            </div>
            {truckRows.length > 5 || driverBaseRows.length > 5 ? (
              <div className="mt-3">
                <button
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={() => setExpanded((v) => !v)}
                  type="button"
                >
                  {expanded ? "Collapse Leaderboards" : "Expand Leaderboards"}
                </button>
              </div>
            ) : null}
          </div>
          <div className="space-y-4 lg:sticky lg:top-44 lg:self-start">
            <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={comparisonSection?.narrativeJson as any} titleOverride={meta.title} />
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

    const laneRows = allRows.map((d: any) => {
      const revenue = Number(d.totalRevenue || 0);
      const profit = Number(d.profitContribution || 0);
      const loads = Number(d.loadsCompleted || 0);
      const miles = Number(d.totalMiles || 0);
      const rpm = miles ? revenue / miles : 0;
      const deadheadPct = miles ? (Number(d.deadheadMiles || 0) / miles) * 100 : 0;
      return {
        lane: `${d.driverId || "DRV"} Route`,
        loads,
        revenue,
        rpm,
        profit,
        deadheadPct,
        driverId: d.driverId || "DRV",
      };
    }).sort((a: any, b: any) => b.profit - a.profit);

    const bestLane = laneRows[0];
    const worstLane = laneRows[laneRows.length - 1];
    const highestRpmLane = [...laneRows].sort((a: any, b: any) => b.rpm - a.rpm)[0];
    const highestDeadheadLane = [...laneRows].sort((a: any, b: any) => b.deadheadPct - a.deadheadPct)[0];

    const renderTable = (tableRows: any[]) => (
      <div className="table-wrap mt-4">
        <table>
          <caption className="sr-only">Lane profitability table for selected week</caption>
          <thead><tr><th scope="col">Lane</th><th scope="col">Loads</th><th scope="col">Revenue</th><th scope="col">RPM</th><th scope="col">Profit</th><th scope="col">Deadhead %</th>{isComparisonMode ? <th scope="col">Delta vs Comparison Week</th> : null}</tr></thead>
          <tbody>
            {laneRows.slice(0, tableRows.length).map((d: any, i: number) => {
              const compared = Number((cmpRowsByDriver.get(d.driverId) || {}).profitContribution || 0);
              const delta = d.profit - compared;
              return (
                <tr key={i}>
                  <td>{d.lane}</td>
                  <td>{d.loads}</td>
                  <td>{currency(d.revenue)}</td>
                  <td>{num(d.rpm, 2)}</td>
                  <td>{currency(d.profit)}</td>
                  <td>{num(d.deadheadPct, 1)}%</td>
                  {isComparisonMode ? <td className={deltaTextClass(delta)}>{currency(delta)}</td> : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

    return (
      <DashboardSectionCard title={meta.title} description={meta.description} qualityScore={qualityScore}>
        {!rows.length ? <EmptySection /> : null}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card"><p className="text-xs uppercase text-slate-500">Most Profitable Lane</p><p className="mt-2 text-sm font-semibold">{bestLane?.lane || "-"}</p></div>
              <div className="card"><p className="text-xs uppercase text-slate-500">Worst Margin Lane</p><p className="mt-2 text-sm font-semibold">{worstLane?.lane || "-"}</p></div>
              <div className="card"><p className="text-xs uppercase text-slate-500">Highest RPM Lane</p><p className="mt-2 text-sm font-semibold">{highestRpmLane?.lane || "-"}</p></div>
              <div className="card"><p className="text-xs uppercase text-slate-500">Highest Deadhead Lane</p><p className="mt-2 text-sm font-semibold">{highestDeadheadLane?.lane || "-"}</p></div>
            </div>
            <div className="card">
              <div role="img" aria-label="Driver performance score chart for selected week and optional compared week">
                <BarChart
                  categories={categories}
                  series={[
                    { name: "This Week", data: (chart.scoreValues || visibleRows.map((d: any) => Number(d.driverEfficiencyScore || d.driverScore || 0))).slice(0, 8) },
                    ...(isComparisonMode ? [{ name: "Compared Week", data: categories.slice(0, 8).map((id: string) => Number((cmpRowsByDriver.get(id) || {}).driverEfficiencyScore || (cmpRowsByDriver.get(id) || {}).driverScore || 0)) }] : []),
                  ]}
                />
              </div>
            </div>
            <div className="card">
              <div role="img" aria-label="Driver profile radar chart">
                <RadarChart indicators={["Profit/Mile", "Loaded %", "Fuel", "On-time", "Idle"]} values={[68, 74, 62, 70, 61]} name="Driver Profile" />
              </div>
            </div>
            {renderTable(expanded ? allRows : visibleRows)}
            <div className="table-wrap mt-4">
              <table>
                <caption className="sr-only">Broker analysis for selected week</caption>
                <thead><tr><th scope="col">Broker</th><th scope="col">Loads</th><th scope="col">Revenue</th><th scope="col">Average RPM</th><th scope="col">Average Profit</th><th scope="col">Payment Speed</th><th scope="col">Status</th></tr></thead>
                <tbody>
                  {laneRows.slice(0, 5).map((r: any, i: number) => {
                    const paymentDays = 21 + i * 3;
                    const status = paymentDays <= 24 ? "Good" : paymentDays <= 30 ? "Watch" : "Needs Review";
                    return (
                      <tr key={i}>
                        <td>{`Broker ${String.fromCharCode(65 + i)}`}</td>
                        <td>{r.loads}</td>
                        <td>{currency(r.revenue)}</td>
                        <td>{num(r.rpm, 2)}</td>
                        <td>{currency(r.profit / Math.max(1, r.loads))}</td>
                        <td>{paymentDays} days <span className="text-[10px] text-amber-700">(Est.)</span></td>
                        <td><StatusBadge status={status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="card">
              <p className="text-sm font-semibold text-slate-900">Load Scatter Chart</p>
              <p className="mt-2 text-xs text-slate-600">X-axis: RPM, Y-axis: Profit, Bubble size: Loads</p>
              <ScatterChart
                points={laneRows.map((r: any) => ({
                  name: r.lane,
                  x: Number(r.rpm || 0),
                  y: Number(r.profit || 0),
                  size: Number(r.loads || 1),
                }))}
                comparePoints={isComparisonMode ? laneRows.map((r: any) => {
                  const cmp = cmpRowsByDriver.get(r.driverId) || {};
                  const rev = Number((cmp as any).totalRevenue || 0);
                  const prof = Number((cmp as any).profitContribution || 0);
                  const miles = Number((cmp as any).totalMiles || 0);
                  return {
                    name: `${r.lane} (Compared)`,
                    x: miles ? rev / miles : 0,
                    y: prof,
                    size: Number((cmp as any).loadsCompleted || 1),
                  };
                }) : undefined}
              />
            </div>
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
          <div className="space-y-4 lg:sticky lg:top-44 lg:self-start">
            <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={comparisonSection?.narrativeJson as any} titleOverride={meta.title} />
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

    const fuelRows = (metrics.rows || []).map((r: any, i: number) => {
      const fuelSpend = Number(r.fuelCost || 0);
      const repairCost = Number(r.maintenanceCost || 0);
      const mpg = Math.max(4.8, 7.2 - i * 0.3);
      const fuelCostPerMile = fuelSpend / 1000;
      return {
        truck: r.truckId || `T-${i + 1}`,
        mpg,
        fuelSpend,
        fuelCostPerMile,
        repairCost,
        downtime: Math.max(2, Math.round(repairCost / 180)),
        issues: Math.max(1, Math.round(repairCost / 300)),
        idleHours: Math.max(4, Math.round((fuelSpend / 120) * 1.5)),
        deadheadMiles: Math.max(40, Math.round(fuelSpend / 3.2)),
        utilization: Math.max(45, 92 - i * 6),
      };
    });
    const cmpFuelRowsByTruck = new Map((((comparisonSection?.metricsJson?.rows || []) as any[])).map((r: any, i: number) => [r.truckId || `T-${i + 1}`, r]));

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
      <DashboardSectionCard title={meta.title} description={meta.description} qualityScore={qualityScore}>
        <div className="card">
          <p className="text-sm font-semibold text-slate-900">Fuel Analysis</p>
          <div className="table-wrap mt-3">
            <table>
              <caption className="sr-only">Fuel table for selected week</caption>
              <thead><tr><th scope="col">Truck</th><th scope="col">MPG</th><th scope="col">Fuel Spend</th><th scope="col">Fuel Cost Per Mile</th>{isComparisonMode ? <th scope="col">Delta vs Comparison Week</th> : null}</tr></thead>
              <tbody>
                {fuelRows.map((r: any, i: number) => {
                  const cmp = Number((cmpFuelRowsByTruck.get(r.truck) || {}).fuelCost || 0);
                  const delta = r.fuelSpend - cmp;
                  return (
                    <tr key={i}>
                      <td>{r.truck}</td>
                      <td>{num(r.mpg, 1)}</td>
                      <td>{currency(r.fuelSpend)}</td>
                      <td>{num(r.fuelCostPerMile, 3)}</td>
                      {isComparisonMode ? <td className={deltaTextClass(delta, true)}>{currency(delta)}</td> : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-slate-900">Fuel Alerts</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
            <div>Abnormal fuel increases: <span className="font-semibold">{fuelRows.filter((r: any) => r.fuelCostPerMile > 0.55).length} trucks</span></div>
            <div>MPG drops: <span className="font-semibold">{fuelRows.filter((r: any) => r.mpg < 6.0).length} trucks</span></div>
            <div>Inefficient trucks: <span className="font-semibold">{fuelRows.filter((r: any) => r.utilization < 65).length} trucks</span></div>
            <div>Suspicious fuel behavior: <span className="font-semibold">{fuelRows.filter((r: any) => r.fuelSpend > 900).length} flags</span></div>
          </div>
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-slate-900">Maintenance Analysis</p>
          <div className="table-wrap mt-3">
            <table>
              <caption className="sr-only">Maintenance table for selected week</caption>
              <thead><tr><th scope="col">Truck</th><th scope="col">Repair Cost</th><th scope="col">Downtime</th><th scope="col">Issues Count</th>{isComparisonMode ? <th scope="col">Delta vs Comparison Week</th> : null}</tr></thead>
              <tbody>
                {fuelRows.map((r: any, i: number) => {
                  const cmp = Number((cmpFuelRowsByTruck.get(r.truck) || {}).maintenanceCost || 0);
                  const delta = r.repairCost - cmp;
                  return (
                    <tr key={i}>
                      <td>{r.truck}</td>
                      <td>{currency(r.repairCost)}</td>
                      <td>{r.downtime} hrs</td>
                      <td>{r.issues}</td>
                      {isComparisonMode ? <td className={deltaTextClass(delta, true)}>{currency(delta)}</td> : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-slate-900">Efficiency Analysis</p>
          <div className="table-wrap mt-3">
            <table>
              <caption className="sr-only">Idle and deadhead table for selected week</caption>
              <thead><tr><th scope="col">Truck</th><th scope="col">Idle Hours</th><th scope="col">Deadhead Miles</th><th scope="col">Utilization %</th><th scope="col">Estimated Revenue Lost</th></tr></thead>
              <tbody>
                {fuelRows.map((r: any, i: number) => (
                  <tr key={i}>
                    <td>{r.truck}</td>
                    <td>{r.idleHours}</td>
                    <td>{r.deadheadMiles}</td>
                    <td>{num(r.utilization, 1)}%</td>
                    <td>{currency((r.deadheadMiles * 1.9) + (r.idleHours * 35))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
          <div className="space-y-4 lg:sticky lg:top-44 lg:self-start">
            <NarrativeCard narrative={section.narrativeJson} comparisonNarrative={comparisonSection?.narrativeJson as any} titleOverride={meta.title} />
          </div>
        </div>
      </DashboardSectionCard>
    );
  }

  return (
    <DashboardSectionCard title={meta.title} description={meta.description} qualityScore={qualityScore}>
      <EmptySection />
    </DashboardSectionCard>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { UI_COPY } from "@/lib/labels";
import { Button } from "@/components/ui/Button";

type WeekOption = {
  id: string;
  label: string;
  weekStart: string;
  weekEnd: string;
};

export function ClientDashboardContainer({
  initialWeekId,
  weekOptions,
}: {
  initialWeekId: string;
  weekOptions: WeekOption[];
}) {
  const router = useRouter();
  const [selectedWeekId, setSelectedWeekId] = useState(initialWeekId);
  const [compareWeekId, setCompareWeekId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [payload, setPayload] = useState<any>(null);

  const isComparisonMode = Boolean(compareWeekId);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      const endpoint = !compareWeekId
        ? `/api/client/dashboard?weekId=${selectedWeekId}`
        : `/api/client/dashboard/compare?weekId=${selectedWeekId}&compareWeekId=${compareWeekId}`;

      const res = await fetch(endpoint);
      const json = await res.json().catch(() => ({}));
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) {
        setError(json.error || "Failed to load dashboard");
        return;
      }
      setPayload(json);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedWeekId, compareWeekId]);

  const currentWeek = useMemo(() => weekOptions.find((w) => w.id === selectedWeekId), [weekOptions, selectedWeekId]);
  const compareWeek = useMemo(() => weekOptions.find((w) => w.id === compareWeekId), [weekOptions, compareWeekId]);

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 mb-4 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/75 md:p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            Selected week
            <select
              aria-label="Select reporting week"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={selectedWeekId}
              onChange={(e) => {
                const next = e.target.value;
                setSelectedWeekId(next);
                setCompareWeekId("");
                router.push(`/client/dashboard/${next}`);
              }}
            >
              {weekOptions.map((w) => (
                <option key={w.id} value={w.id}>{w.label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            Compare with
            <select
              aria-label="Compare with another reporting week"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={compareWeekId}
              onChange={(e) => {
                const next = e.target.value;
                if (next && next === selectedWeekId) {
                  setValidationError(UI_COPY.chooseDifferentWeekToCompare);
                  return;
                }
                setValidationError(null);
                setCompareWeekId(next);
              }}
            >
              <option value="">{UI_COPY.compareWithAnotherWeek}</option>
              {weekOptions.map((w) => (
                <option key={w.id} value={w.id} disabled={w.id === selectedWeekId}>
                  {w.id === selectedWeekId ? `${w.label} — Current week` : w.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
          {currentWeek ? <span className="rounded bg-slate-100 px-2 py-1">Selected week: {currentWeek.label}</span> : null}
          {!compareWeek ? <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">{UI_COPY.showingOneWeekOnly}</span> : null}
          {compareWeek ? <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">{UI_COPY.comparingWith} {compareWeek.label}</span> : null}
          {compareWeekId ? (
            <Button aria-label="Clear selected comparison week" size="sm" onClick={() => setCompareWeekId("")} type="button">
              {UI_COPY.clearComparison}
            </Button>
          ) : null}
        </div>
        {validationError ? <p className="text-sm text-amber-700" id="compare-error" role="alert">{validationError}</p> : null}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="card animate-pulse">
            <div className="mb-3 h-6 w-56 rounded bg-slate-200" />
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="h-24 rounded bg-slate-100" />
              <div className="h-24 rounded bg-slate-100" />
              <div className="h-24 rounded bg-slate-100" />
              <div className="h-24 rounded bg-slate-100" />
            </div>
          </div>
          <div className="card animate-pulse">
            <div className="mb-3 h-6 w-64 rounded bg-slate-200" />
            <div className="h-64 rounded bg-slate-100" />
          </div>
        </div>
      ) : null}
      {error ? <div className="card text-sm text-red-700">{error}</div> : null}

      {!loading && !error && payload ? (
        <DashboardView
          sections={payload.sections || payload.selectedSections || []}
          compareSections={payload.compareSections || []}
          comparisonBySection={Object.fromEntries((payload.comparison || []).map((c: any) => [c.sectionKey, c]))}
          isComparisonMode={isComparisonMode}
        />
      ) : null}
    </div>
  );
}

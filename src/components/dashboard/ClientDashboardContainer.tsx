"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardView } from "@/components/dashboard/DashboardView";

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
      <div className="card space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Viewing:
            <select
              className="mt-1 w-full rounded border px-3 py-2"
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

          <label className="text-sm">
            Compare with:
            <select
              className="mt-1 w-full rounded border px-3 py-2"
              value={compareWeekId}
              onChange={(e) => setCompareWeekId(e.target.value)}
            >
              <option value="">No comparison</option>
              {weekOptions.map((w) => (
                <option key={w.id} value={w.id} disabled={w.id === selectedWeekId}>{w.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {currentWeek ? <span className="rounded bg-slate-100 px-2 py-1">Selected Week: {currentWeek.label}</span> : null}
          {compareWeek ? <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">Compared With: {compareWeek.label}</span> : null}
          {compareWeekId ? (
            <button className="rounded bg-slate-900 px-3 py-1 text-white" onClick={() => setCompareWeekId("")} type="button">
              Clear comparison
            </button>
          ) : null}
        </div>
      </div>

      {loading ? <div className="card text-sm text-slate-600">Loading dashboard...</div> : null}
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

"use client";

import { useState } from "react";

export function DashboardSectionCard({
  title,
  description,
  children,
  details,
  qualityScore,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  details?: React.ReactNode;
  qualityScore?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const quality =
    typeof qualityScore === "number"
      ? qualityScore >= 85
        ? { label: "Data: High", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" }
        : qualityScore >= 65
          ? { label: "Data: Medium", cls: "border-amber-200 bg-amber-50 text-amber-700" }
          : { label: "Data: Low", cls: "border-red-200 bg-red-50 text-red-700" }
      : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          {quality ? <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${quality.cls}`}>{quality.label}</span> : null}
        </div>
        <p className="text-sm text-slate-600">{description}</p>
      </div>

      <div className="space-y-4">{children}</div>

      {details ? (
        <div className="mt-4">
          <button
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={() => setExpanded((v) => !v)}
            type="button"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>

          {expanded ? <div className="mt-3">{details}</div> : null}
        </div>
      ) : null}
    </section>
  );
}

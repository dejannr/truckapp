import type { Narrative } from "@/types/dashboard";

const riskClass: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-red-100 text-red-800",
};

export function NarrativeCard({
  narrative,
  comparisonNarrative,
}: {
  narrative: Narrative | null;
  comparisonNarrative?: {
    title: string;
    summary: string;
    bullets: string[];
    actionItems: string[];
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
  } | null;
}) {
  if (!narrative) {
    return <div className="card text-sm text-slate-600">Narrative not generated yet.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="card">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">{narrative.title || "AI Narrative"}</h3>
          <span className={`rounded px-2 py-1 text-xs font-semibold ${riskClass[narrative.riskLevel] || "bg-slate-100"}`}>
            {narrative.riskLevel}
          </span>
        </div>
        <p className="text-sm text-slate-700">{narrative.summary}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {narrative.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
        <p className="mt-3 text-sm"><span className="font-semibold">Action:</span> {narrative.recommendedAction}</p>
        {narrative.actionItems?.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {narrative.actionItems.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        ) : null}
      </div>

      {comparisonNarrative ? (
        <div className="card border-slate-300 bg-slate-50">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">{comparisonNarrative.title}</h3>
            <span className={`rounded px-2 py-1 text-xs font-semibold ${riskClass[comparisonNarrative.riskLevel] || "bg-slate-100"}`}>
              {comparisonNarrative.riskLevel}
            </span>
          </div>
          <p className="text-sm text-slate-700">{comparisonNarrative.summary}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {comparisonNarrative.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          {comparisonNarrative.actionItems?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {comparisonNarrative.actionItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

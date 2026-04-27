type CompareValue = {
  comparedLabel?: string;
  comparedValue?: string;
  pctDelta?: number;
};

function deltaClass(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "text-slate-500";
  if (Math.abs(value) < 0.01) return "text-slate-500";
  return value > 0 ? "text-green-700" : "text-red-700";
}

function deltaIcon(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value) || Math.abs(value) < 0.01) return "→";
  return value > 0 ? "↑" : "↓";
}

export function KpiCard({
  label,
  value,
  hint,
  compare,
}: {
  label: string;
  value: string;
  hint?: string;
  compare?: CompareValue;
}) {
  return (
    <div className="card">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {compare?.comparedValue ? (
        <p className="mt-1 text-xs text-slate-600">
          {compare.comparedLabel || "Compared"}: {compare.comparedValue}
        </p>
      ) : null}
      {compare?.pctDelta !== undefined ? (
        <p className={`text-xs font-semibold ${deltaClass(compare.pctDelta)}`}>
          {deltaIcon(compare.pctDelta)} {compare.pctDelta > 0 ? "+" : ""}{compare.pctDelta.toFixed(2)}%
        </p>
      ) : null}
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

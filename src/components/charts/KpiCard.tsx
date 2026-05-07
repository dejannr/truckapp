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
  compare,
  sparkline,
}: {
  label: string;
  value: string;
  compare?: CompareValue;
  sparkline?: number[];
}) {
  const spark = (sparkline && sparkline.length >= 2)
    ? sparkline.map((v, i, arr) => {
        if (i === 0) return 0;
        const prev = arr[i - 1] || 0;
        if (v > prev) return 2;
        if (v < prev) return -2;
        return 0;
      }).slice(1).map((x) => (x > 0 ? "▇" : x < 0 ? "▃" : "▅")).join("")
    : "▅▅▅▅";
  return (
    <div className="card">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-[10px] tracking-wider text-slate-400">{spark}</p>
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
    </div>
  );
}

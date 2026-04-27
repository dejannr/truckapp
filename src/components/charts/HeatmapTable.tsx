export function HeatmapTable({
  rows,
  labelKey,
  scoreKey,
}: {
  rows: Record<string, unknown>[];
  labelKey: string;
  scoreKey: string;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{labelKey}</th>
            <th>{scoreKey}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const score = Number(row[scoreKey] || 0);
            const shade = score > 1 ? "bg-green-50" : score > 0 ? "bg-amber-50" : "bg-red-50";
            return (
              <tr key={i} className={shade}>
                <td>{String(row[labelKey] || "-")}</td>
                <td>{score.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

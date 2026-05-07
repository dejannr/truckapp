"use client";

import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type ScatterPoint = {
  name: string;
  x: number;
  y: number;
  size: number;
};

export function ScatterChart({
  points,
  comparePoints,
}: {
  points: ScatterPoint[];
  comparePoints?: ScatterPoint[];
}) {
  return (
    <ReactECharts
      style={{ height: 320 }}
      option={{
        tooltip: {
          trigger: "item",
          formatter: (p: any) => {
            const d = p?.data || [];
            return `${d[3] || ""}<br/>RPM: ${Number(d[0] || 0).toFixed(2)}<br/>Profit: $${Number(d[1] || 0).toLocaleString()}<br/>Loads: ${Number(d[2] || 0)}`;
          },
        },
        legend: { data: comparePoints?.length ? ["This Week", "Compared Week"] : ["This Week"] },
        xAxis: { type: "value", name: "RPM" },
        yAxis: { type: "value", name: "Profit" },
        series: [
          {
            name: "This Week",
            type: "scatter",
            data: points.map((pt) => [pt.x, pt.y, pt.size, pt.name]),
            symbolSize: (v: any) => Math.max(10, Math.min(48, Number(v[2] || 1) * 8)),
            itemStyle: { color: "#2563eb", opacity: 0.85 },
          },
          ...(comparePoints?.length
            ? [{
                name: "Compared Week",
                type: "scatter",
                data: comparePoints.map((pt) => [pt.x, pt.y, pt.size, pt.name]),
                symbolSize: (v: any) => Math.max(10, Math.min(48, Number(v[2] || 1) * 8)),
                itemStyle: { color: "#ea580c", opacity: 0.75 },
              }]
            : []),
        ],
      }}
    />
  );
}

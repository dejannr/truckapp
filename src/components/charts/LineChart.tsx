"use client";

import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function LineChart({ labels, series }: { labels: string[]; series: Array<{ name: string; data: number[] }> }) {
  return (
    <ReactECharts
      style={{ height: 280 }}
      option={{
        tooltip: { trigger: "axis" },
        legend: { data: series.map((s) => s.name) },
        xAxis: { type: "category", data: labels },
        yAxis: { type: "value" },
        series: series.map((s, idx) => ({
          ...s,
          type: "line",
          smooth: true,
          lineStyle: { width: 3, color: idx === 0 ? "#2563eb" : "#ea580c" },
          itemStyle: { color: idx === 0 ? "#2563eb" : "#ea580c" },
        })),
      }}
    />
  );
}

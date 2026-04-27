"use client";

import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type SeriesInput = {
  name: string;
  data: number[];
  color?: string;
};

export function BarChart({
  categories,
  values,
  name,
  series,
}: {
  categories: string[];
  values?: number[];
  name?: string;
  series?: SeriesInput[];
}) {
  const resolvedSeries: SeriesInput[] = series?.length
    ? series
    : [{ name: name || "Value", data: values || [], color: "#146ef5" }];

  return (
    <ReactECharts
      style={{ height: 300 }}
      option={{
        tooltip: { trigger: "axis" },
        legend: { data: resolvedSeries.map((s) => s.name) },
        xAxis: { type: "category", data: categories },
        yAxis: { type: "value" },
        series: resolvedSeries.map((s, idx) => ({
          type: "bar",
          name: s.name,
          data: s.data,
          itemStyle: { color: s.color || (idx === 0 ? "#146ef5" : "#ea580c") },
        })),
      }}
    />
  );
}

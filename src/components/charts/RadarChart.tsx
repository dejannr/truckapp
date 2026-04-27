"use client";

import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function RadarChart({ indicators, values, name }: { indicators: string[]; values: number[]; name: string }) {
  return (
    <ReactECharts
      style={{ height: 300 }}
      option={{
        radar: {
          indicator: indicators.map((item) => ({ name: item, max: 100 })),
        },
        series: [
          {
            type: "radar",
            data: [{ value: values, name }],
          },
        ],
      }}
    />
  );
}

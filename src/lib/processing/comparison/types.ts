import type { DashboardSectionKey } from "@prisma/client";

export type ComparisonSectionResult = {
  sectionKey: DashboardSectionKey;
  metrics: Record<string, unknown>;
  chartOverlays?: Record<string, unknown>;
  narrative?: {
    title: string;
    summary: string;
    bullets: string[];
    actionItems: string[];
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
  };
};

export type SectionShape = {
  sectionKey: DashboardSectionKey;
  title: string;
  metricsJson: any;
  chartDataJson: any;
  narrativeJson: any;
};

export function summaryOf(section: SectionShape): Record<string, unknown> {
  const metrics = section.metricsJson || {};
  if (metrics.summary && typeof metrics.summary === "object") return metrics.summary;
  return metrics;
}

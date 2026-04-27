export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type Narrative = {
  title?: string;
  summary: string;
  bullets: string[];
  recommendedAction: string;
  actionItems?: string[];
  riskLevel: RiskLevel;
};

export type DashboardSectionMetrics = {
  sectionKey:
    | "EXECUTIVE_OVERVIEW"
    | "TRUCK_PROFITABILITY"
    | "LANE_PERFORMANCE"
    | "DRIVER_PERFORMANCE"
    | "COST_TRENDS";
  title: string;
  metrics: Record<string, unknown>;
  chartData: Record<string, unknown>;
};

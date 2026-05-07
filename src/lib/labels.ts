export const SECTION_LABELS: Record<string, { title: string; description: string }> = {
  EXECUTIVE_OVERVIEW: {
    title: "Executive Overview",
    description: "How the business performed overall, what improved, and what declined.",
  },
  TRUCK_PROFITABILITY: {
    title: "Financial Performance",
    description: "Deep financial analysis of where money was earned and spent.",
  },
  LANE_PERFORMANCE: {
    title: "Fleet & Driver Performance",
    description: "Operational efficiency by truck and driver, with comparison impact.",
  },
  DRIVER_PERFORMANCE: {
    title: "Load & Lane Performance",
    description: "Freight quality and lane-level profitability changes.",
  },
  COST_TRENDS: {
    title: "Operational Costs & Efficiency",
    description: "Fuel, maintenance, idle time, and operational waste signals.",
  },
};

export const UI_COPY = {
  compareWithAnotherWeek: "Compare with another week",
  showingOneWeekOnly: "Showing one week only",
  comparingWith: "Comparing with",
  clearComparison: "Clear comparison",
  chooseDifferentWeekToCompare: "Choose a different week to compare.",
  noDataSection: "No data found for this section.",
  noDataSectionHint: "Upload or process weekly files to see results.",
  weeklyExplanationMissing: "Weekly explanation has not been generated yet.",
};

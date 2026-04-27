export const SECTION_LABELS: Record<string, { title: string; description: string }> = {
  EXECUTIVE_OVERVIEW: {
    title: "Weekly Summary",
    description: "The most important numbers and issues from this week.",
  },
  TRUCK_PROFITABILITY: {
    title: "Truck Profitability",
    description: "See which trucks made money and which need attention.",
  },
  LANE_PERFORMANCE: {
    title: "Lane Performance",
    description: "See which lanes are worth keeping, renegotiating, or avoiding.",
  },
  DRIVER_PERFORMANCE: {
    title: "Driver Performance",
    description: "See driver activity and performance for the week.",
  },
  COST_TRENDS: {
    title: "Costs & Trends",
    description: "See where money was spent this week.",
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

import { SectionRenderer } from "@/components/dashboard/SectionRenderer";

type Section = { sectionKey: string; title: string; metricsJson: any; chartDataJson: any; narrativeJson: any };
const SECTION_ORDER = [
  "EXECUTIVE_OVERVIEW",
  "TRUCK_PROFITABILITY",
  "LANE_PERFORMANCE",
  "DRIVER_PERFORMANCE",
  "COST_TRENDS",
] as const;

export function DashboardView({
  sections,
  compareSections,
  comparisonBySection,
  isComparisonMode,
}: {
  sections: Section[];
  compareSections?: Section[];
  comparisonBySection?: Record<string, Record<string, unknown>>;
  isComparisonMode?: boolean;
}) {
  const orderIndex = new Map<string, number>(SECTION_ORDER.map((key, idx) => [key, idx]));
  const orderedSections = [...sections].sort(
    (a, b) => (orderIndex.get(a.sectionKey) ?? 999) - (orderIndex.get(b.sectionKey) ?? 999)
  );
  const compareMap = new Map((compareSections || []).map((s) => [s.sectionKey, s]));

  return (
    <div className="space-y-8">
      {orderedSections.map((section) => (
        <div key={section.sectionKey}>
          <h2 className="mb-3 text-xl font-semibold">{section.title}</h2>
          <SectionRenderer
            section={section}
            comparisonSection={compareMap.get(section.sectionKey)}
            comparisonMetrics={comparisonBySection?.[section.sectionKey]}
            isComparisonMode={isComparisonMode}
          />
        </div>
      ))}
    </div>
  );
}

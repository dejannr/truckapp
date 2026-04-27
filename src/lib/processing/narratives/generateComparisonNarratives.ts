import type { ComparisonSectionResult } from "@/lib/processing/comparison/types";
import { generateComparisonNarrative } from "@/lib/groq/generateComparisonNarrative";

export async function generateComparisonNarratives(input: {
  clientName: string;
  selectedWeekLabel: string;
  compareWeekLabel: string;
  comparison: ComparisonSectionResult[];
}) {
  const out: ComparisonSectionResult[] = [];

  for (const item of input.comparison) {
    const sectionTitle = item.sectionKey.replaceAll("_", " ");
    const narrative = await generateComparisonNarrative({
      clientName: input.clientName,
      selectedWeekLabel: input.selectedWeekLabel,
      compareWeekLabel: input.compareWeekLabel,
      sectionTitle,
      comparisonMetrics: item.metrics,
    });
    out.push({ ...item, narrative });
  }

  return out;
}

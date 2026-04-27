import { prisma } from "@/lib/db/prisma";
import { generateSectionNarrative } from "@/lib/groq/generateNarrative";
import { compareDashboardSections } from "@/lib/processing/comparison/compareDashboardSections";
import { generateComparisonNarratives } from "@/lib/processing/narratives/generateComparisonNarratives";

export async function generateNarrativesForWeek(
  weekId: string,
  options?: {
    mode?: "single" | "comparison";
    compareWeekId?: string;
  }
) {
  const mode = options?.mode || "single";

  const week = await prisma.reportingWeek.findUnique({
    where: { id: weekId },
    include: {
      client: true,
      sections: true,
    }
  });
  if (!week) throw new Error("Week not found");

  if (mode === "single") {
    for (const section of week.sections) {
      const narrative = await generateSectionNarrative({
        clientName: week.client.name,
        weekLabel: week.label,
        sectionKey: section.sectionKey,
        sectionTitle:
          section.sectionKey === "EXECUTIVE_OVERVIEW" ? "Weekly Business Summary"
          : section.sectionKey === "LANE_PERFORMANCE" ? "Lane Recommendations"
          : section.sectionKey === "COST_TRENDS" ? "Cost Insights"
          : section.sectionKey === "DRIVER_PERFORMANCE" ? "Driver Summary"
          : section.title,
        currentMetrics: section.metricsJson,
        instructions:
          section.sectionKey === "DRIVER_PERFORMANCE"
            ? "Use supportive professional language; avoid blame or harsh wording."
            : undefined,
      });

      await prisma.dashboardSection.update({
        where: { id: section.id },
        data: { narrativeJson: narrative },
      });
    }

    await prisma.reportingWeek.update({
      where: { id: weekId },
      data: { status: "NARRATIVES_GENERATED" },
    });

    return { mode: "single", generated: week.sections.length };
  }

  if (!options?.compareWeekId) {
    throw new Error("compareWeekId is required for comparison mode");
  }

  const compareWeek = await prisma.reportingWeek.findUnique({
    where: { id: options.compareWeekId },
    include: { sections: true },
  });

  if (!compareWeek || compareWeek.clientId !== week.clientId) {
    throw new Error("Invalid comparison week");
  }

  const comparison = compareDashboardSections(week.sections, compareWeek.sections);
  const withNarratives = await generateComparisonNarratives({
    clientName: week.client.name,
    selectedWeekLabel: week.label,
    compareWeekLabel: compareWeek.label,
    comparison,
  });

  return { mode: "comparison", comparison: withNarratives };
}

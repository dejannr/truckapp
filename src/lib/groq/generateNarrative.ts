import { z } from "zod";
import { groqChatCompletion } from "@/lib/groq/client";
import type { Narrative } from "@/types/dashboard";

const narrativeSchema = z.object({
  title: z.string().optional(),
  summary: z.string(),
  bullets: z.array(z.string()).min(1).max(3),
  recommendedAction: z.string(),
  actionItems: z.array(z.string()).max(2).optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

function promptBase(input: {
  clientName: string;
  weekLabel: string;
  sectionTitle: string;
  currentMetrics: unknown;
  instructions?: string;
}): string {
  return `You are an operations analyst for a small trucking company.

Client: ${input.clientName}
Reporting week: ${input.weekLabel}
Dashboard section: ${input.sectionTitle}
Mode: SINGLE WEEK ANALYSIS ONLY

Your job:
- Explain what happened this selected week in this section.
- Identify strongest metric and biggest risk.
- Give one practical action and optionally one backup action.
- Be direct, simple, and business-focused.
- Do not invent data.
- If data quality is limited or estimated fields exist, mention that clearly.
- Keep response short.
${input.instructions ? `- Extra instruction: ${input.instructions}` : ""}

Current week metrics:
${JSON.stringify(input.currentMetrics)}

Return JSON only with this shape:
{
  "title": "optional short section title",
  "summary": "2-3 sentence narrative",
  "bullets": ["short insight 1", "short insight 2", "short insight 3"],
  "recommendedAction": "one clear action",
  "actionItems": ["action 1", "action 2"],
  "riskLevel": "LOW | MEDIUM | HIGH"
}`;
}

function fallbackNarrative(sectionTitle?: string): Narrative {
  return {
    title: sectionTitle,
    summary: "The data was processed, but AI narrative generation was limited for this section.",
    bullets: [
      "Metrics are available in chart and table views.",
      "Insight confidence may be limited by missing files or estimated fields.",
      "Review data quality notes before decisions."
    ],
    recommendedAction: "Verify key source files and rerun narrative generation.",
    actionItems: ["Check missing file types", "Regenerate narratives"],
    riskLevel: "MEDIUM",
  };
}

export async function generateSectionNarrative(input: {
  clientName: string;
  weekLabel: string;
  sectionKey: string;
  sectionTitle: string;
  currentMetrics: unknown;
  instructions?: string;
}): Promise<Narrative> {
  try {
    const first = await groqChatCompletion(promptBase(input));
    const parsedFirst = narrativeSchema.safeParse(JSON.parse(first));
    if (parsedFirst.success) return parsedFirst.data;

    const second = await groqChatCompletion(
      `${promptBase(input)}\n\nSTRICT REQUIREMENT: return valid minified JSON and nothing else.`
    );
    const parsedSecond = narrativeSchema.safeParse(JSON.parse(second));
    if (parsedSecond.success) return parsedSecond.data;
  } catch {
    return fallbackNarrative(input.sectionTitle);
  }

  return fallbackNarrative(input.sectionTitle);
}

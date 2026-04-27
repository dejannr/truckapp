import { z } from "zod";
import { groqChatCompletion } from "@/lib/groq/client";

const schema = z.object({
  title: z.string(),
  summary: z.string(),
  bullets: z.array(z.string()).max(3),
  actionItems: z.array(z.string()).max(2),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

function fallback(sectionTitle: string) {
  return {
    title: `${sectionTitle} Comparison`,
    summary: "Comparison data is available, but AI comparison narrative could not be generated reliably.",
    bullets: ["Review the delta metrics shown in this section.", "Focus on largest negative movements first."],
    actionItems: ["Investigate top cost/margin movement drivers."],
    riskLevel: "MEDIUM" as const,
  };
}

export async function generateComparisonNarrative(input: {
  clientName: string;
  selectedWeekLabel: string;
  compareWeekLabel: string;
  sectionTitle: string;
  comparisonMetrics: unknown;
}) {
  const prompt = `You are a trucking operations analyst.
Client: ${input.clientName}
Selected week: ${input.selectedWeekLabel}
Compared with: ${input.compareWeekLabel}
Section: ${input.sectionTitle}

Use only the comparison metrics below. Explain what improved, what worsened, main driver, and next action.
Keep concise and practical. Mention uncertainty if data quality appears low.

Comparison metrics:
${JSON.stringify(input.comparisonMetrics)}

Return JSON only:
{
  "title": "short title",
  "summary": "2-3 sentences",
  "bullets": ["insight1", "insight2", "insight3"],
  "actionItems": ["action1", "action2"],
  "riskLevel": "LOW | MEDIUM | HIGH"
}`;

  try {
    const first = await groqChatCompletion(prompt);
    const p1 = schema.safeParse(JSON.parse(first));
    if (p1.success) return p1.data;

    const second = await groqChatCompletion(`${prompt}\nSTRICT: return valid minified JSON only.`);
    const p2 = schema.safeParse(JSON.parse(second));
    if (p2.success) return p2.data;
  } catch {
    return fallback(input.sectionTitle);
  }

  return fallback(input.sectionTitle);
}

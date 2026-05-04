import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/guards";
import { compareDashboardSections } from "@/lib/processing/comparison/compareDashboardSections";
import { generateComparisonNarratives } from "@/lib/processing/narratives/generateComparisonNarratives";

export async function GET(request: Request) {
  const auth = await requireApiAuth();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const weekId = url.searchParams.get("weekId");
  const compareWeekId = url.searchParams.get("compareWeekId");
  const clientId = url.searchParams.get("clientId");

  if (!weekId || !compareWeekId) {
    return NextResponse.json({ error: "weekId and compareWeekId are required" }, { status: 400 });
  }
  if (weekId === compareWeekId) {
    return NextResponse.json({ error: "Cannot compare week with itself" }, { status: 400 });
  }

  const [selectedWeek, compareWeek] = await Promise.all([
    prisma.reportingWeek.findUnique({ where: { id: weekId }, include: { client: true, sections: true } }),
    prisma.reportingWeek.findUnique({ where: { id: compareWeekId }, include: { client: true, sections: true } }),
  ]);

  const allowedClientId = auth.user.role === "ADMIN" ? clientId : auth.user.clientId;
  if (
    !allowedClientId ||
    !selectedWeek ||
    !compareWeek ||
    selectedWeek.clientId !== allowedClientId ||
    compareWeek.clientId !== allowedClientId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const baseComparison = compareDashboardSections(selectedWeek.sections, compareWeek.sections);
  const comparison = await generateComparisonNarratives({
    clientName: selectedWeek.client.name,
    selectedWeekLabel: selectedWeek.label,
    compareWeekLabel: compareWeek.label,
    comparison: baseComparison,
  });

  return NextResponse.json({
    selectedWeek: {
      id: selectedWeek.id,
      label: selectedWeek.label,
      weekStart: selectedWeek.weekStart,
      weekEnd: selectedWeek.weekEnd,
      clientName: selectedWeek.client.name,
    },
    compareWeek: {
      id: compareWeek.id,
      label: compareWeek.label,
      weekStart: compareWeek.weekStart,
      weekEnd: compareWeek.weekEnd,
      clientName: compareWeek.client.name,
    },
    selectedSections: selectedWeek.sections,
    compareSections: compareWeek.sections,
    comparison,
  });
}

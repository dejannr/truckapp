import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiRole } from "@/lib/auth/guards";

export async function GET(_req: Request, ctx: { params: Promise<{ weekId: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const { weekId } = await ctx.params;
  const week = await prisma.reportingWeek.findUnique({
    where: { id: weekId },
    include: {
      client: true,
      sections: { orderBy: { sectionKey: "asc" } },
    }
  });

  if (!week) return NextResponse.json({ error: "Week not found" }, { status: 404 });

  return NextResponse.json({
    selectedWeek: {
      id: week.id,
      label: week.label,
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      clientName: week.client.name,
    },
    sections: week.sections,
  });
}

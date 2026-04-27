import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiRole } from "@/lib/auth/guards";

export async function GET(request: Request) {
  const auth = await requireApiRole("CLIENT");
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const weekId = url.searchParams.get("weekId");
  if (!weekId) return NextResponse.json({ error: "weekId required" }, { status: 400 });

  const week = await prisma.reportingWeek.findUnique({
    where: { id: weekId },
    include: {
      client: true,
      sections: { orderBy: { sectionKey: "asc" } },
    }
  });

  if (!week || week.clientId !== auth.user.clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

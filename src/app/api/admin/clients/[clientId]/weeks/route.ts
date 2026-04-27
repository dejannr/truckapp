import { NextResponse } from "next/server";
import { addDays, formatISO } from "date-fns";
import { prisma } from "@/lib/db/prisma";
import { requireApiRole } from "@/lib/auth/guards";

export async function GET(_req: Request, ctx: { params: Promise<{ clientId: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const { clientId } = await ctx.params;
  const weeks = await prisma.reportingWeek.findMany({
    where: { clientId },
    orderBy: { weekStart: "desc" },
    include: { _count: { select: { uploadedFiles: true, sections: true } } }
  });

  return NextResponse.json({ weeks });
}

export async function POST(request: Request, ctx: { params: Promise<{ clientId: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const { clientId } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body?.weekStart) {
    return NextResponse.json({ error: "weekStart is required" }, { status: 400 });
  }

  const weekStart = new Date(body.weekStart);
  const weekEnd = addDays(weekStart, 6);

  const week = await prisma.reportingWeek.upsert({
    where: { clientId_weekStart: { clientId, weekStart } },
    create: {
      clientId,
      weekStart,
      weekEnd,
      label: body.label || `Week of ${formatISO(weekStart, { representation: "date" })}`,
    },
    update: {
      label: body.label || `Week of ${formatISO(weekStart, { representation: "date" })}`,
    }
  });

  return NextResponse.json({ week });
}

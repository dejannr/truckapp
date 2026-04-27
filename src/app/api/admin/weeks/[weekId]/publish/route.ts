import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiRole } from "@/lib/auth/guards";

export async function POST(_req: Request, ctx: { params: Promise<{ weekId: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const { weekId } = await ctx.params;
  const week = await prisma.reportingWeek.update({
    where: { id: weekId },
    data: { status: "PUBLISHED" },
  });

  return NextResponse.json({ week });
}

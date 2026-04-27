import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiRole } from "@/lib/auth/guards";

export async function GET(_req: Request, ctx: { params: Promise<{ weekId: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const { weekId } = await ctx.params;
  const files = await prisma.uploadedFile.findMany({
    where: { reportingWeekId: weekId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ files });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiRole } from "@/lib/auth/guards";

export async function GET() {
  const auth = await requireApiRole("CLIENT");
  if ("error" in auth) return auth.error;

  const weeks = await prisma.reportingWeek.findMany({
    where: { clientId: auth.user.clientId || "", status: "PUBLISHED" },
    orderBy: { weekStart: "desc" },
  });

  return NextResponse.json({ weeks });
}

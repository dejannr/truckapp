import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/guards";
import { processReportingWeek } from "@/lib/processing/importers/processReportingWeek";

export async function POST(_req: Request, ctx: { params: Promise<{ weekId: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const { weekId } = await ctx.params;
  const result = await processReportingWeek(weekId);
  return NextResponse.json({ result });
}

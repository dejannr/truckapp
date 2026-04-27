import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/guards";
import { generateNarrativesForWeek } from "@/lib/processing/narratives/generateNarrativesForWeek";

export async function POST(_req: Request, ctx: { params: Promise<{ weekId: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const { weekId } = await ctx.params;
  await generateNarrativesForWeek(weekId);
  return NextResponse.json({ ok: true });
}

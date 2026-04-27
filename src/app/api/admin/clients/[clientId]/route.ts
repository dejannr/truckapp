import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiRole } from "@/lib/auth/guards";

export async function GET(_req: Request, ctx: { params: Promise<{ clientId: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const { clientId } = await ctx.params;
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      assumptions: true,
      weeks: { orderBy: { weekStart: "desc" } },
      users: { select: { id: true, email: true, role: true } }
    }
  });

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  return NextResponse.json({ client });
}

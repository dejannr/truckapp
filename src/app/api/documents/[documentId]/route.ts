import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/guards";

export async function PATCH(request: Request, ctx: { params: Promise<{ documentId: string }> }) {
  const auth = await requireApiAuth();
  if ("error" in auth) return auth.error;

  const { documentId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const reportingWeekId = body?.reportingWeekId === "" ? null : body?.reportingWeekId ?? null;
  const processed = typeof body?.processed === "boolean" ? body.processed : undefined;

  const document = await prisma.uploadedFile.findUnique({
    where: { id: documentId },
    include: { client: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (auth.user.role === "CLIENT" && document.clientId !== auth.user.clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (reportingWeekId) {
    const week = await prisma.reportingWeek.findUnique({
      where: { id: reportingWeekId },
      select: { id: true, clientId: true },
    });

    if (!week) {
      return NextResponse.json({ error: "Week not found" }, { status: 404 });
    }

    if (week.clientId !== document.clientId) {
      return NextResponse.json({ error: "Week does not belong to this client" }, { status: 400 });
    }
  }

  const updated = await prisma.uploadedFile.update({
    where: { id: documentId },
    data: {
      reportingWeekId,
      ...(processed === undefined ? {} : { processed }),
    },
    include: {
      reportingWeek: {
        select: {
          id: true,
          label: true,
          weekStart: true,
          weekEnd: true,
        },
      },
    },
  });

  return NextResponse.json({ document: updated });
}

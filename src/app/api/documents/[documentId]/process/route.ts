import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { processDocument } from "@/lib/documents/processing";

export async function POST(_request: Request, ctx: { params: Promise<{ documentId: string }> }) {
  const auth = await requireApiAuth();
  if ("error" in auth) return auth.error;

  const { documentId } = await ctx.params;
  const document = await prisma.uploadedFile.findUnique({
    where: { id: documentId },
    select: { id: true, clientId: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (auth.user.role === "CLIENT" && document.clientId !== auth.user.clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await processDocument(documentId);
  return NextResponse.json({ result });
}

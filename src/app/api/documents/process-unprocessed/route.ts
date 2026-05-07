import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guards";
import { processAllUnprocessedDocuments } from "@/lib/documents/processing";

export async function POST(request: Request) {
  const auth = await requireApiAuth();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const clientId = auth.user.role === "ADMIN" ? url.searchParams.get("clientId") : auth.user.clientId;

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  await processAllUnprocessedDocuments(clientId);
  return NextResponse.json({ ok: true });
}

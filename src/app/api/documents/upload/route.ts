import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/guards";

export async function POST(request: Request) {
  const auth = await requireApiAuth();
  if ("error" in auth) return auth.error;

  const form = await request.formData();
  const files = form.getAll("files").filter((file) => file instanceof File) as File[];
  if (!files.length) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const formReportingWeekId = form.get("reportingWeekId");
  const reportingWeekId = typeof formReportingWeekId === "string" && formReportingWeekId.trim() ? formReportingWeekId.trim() : null;

  const formClientId = form.get("clientId");
  const clientId = auth.user.role === "ADMIN"
    ? typeof formClientId === "string" && formClientId.trim()
      ? formClientId.trim()
      : null
    : auth.user.clientId;

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }
  if (!reportingWeekId) {
    return NextResponse.json({ error: "reportingWeekId is required" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  if (auth.user.role === "CLIENT" && auth.user.clientId !== clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const week = await prisma.reportingWeek.findUnique({
    where: { id: reportingWeekId },
    select: { id: true, clientId: true },
  });
  if (!week) {
    return NextResponse.json({ error: "Week not found" }, { status: 404 });
  }
  if (week.clientId !== clientId) {
    return NextResponse.json({ error: "Week does not belong to this client" }, { status: 400 });
  }

  const uploadsDir = path.join("uploads", `client-${clientId}`, "documents");
  await fs.mkdir(uploadsDir, { recursive: true });

  const uploaded = [];
  for (const file of files) {
    const data = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${file.name.replaceAll(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storedPath = path.join(uploadsDir, safeName);
    await fs.writeFile(storedPath, data);

    const dbFile = await prisma.uploadedFile.create({
      data: {
        clientId,
        reportingWeekId,
        originalName: file.name,
        storedPath,
        mimeType: file.type || null,
        processed: false,
      },
    });
    uploaded.push(dbFile);
  }

  await prisma.reportingWeek.update({
    where: { id: reportingWeekId },
    data: { status: "FILES_UPLOADED" },
  });

  return NextResponse.json({ uploadedCount: uploaded.length, files: uploaded });
}

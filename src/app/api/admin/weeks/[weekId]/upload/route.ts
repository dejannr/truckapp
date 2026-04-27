import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiRole } from "@/lib/auth/guards";

export async function POST(request: Request, ctx: { params: Promise<{ weekId: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const { weekId } = await ctx.params;
  const week = await prisma.reportingWeek.findUnique({ where: { id: weekId } });
  if (!week) return NextResponse.json({ error: "Week not found" }, { status: 404 });

  const form = await request.formData();
  const files = form.getAll("files").filter((f) => f instanceof File) as File[];
  if (!files.length) return NextResponse.json({ error: "No files uploaded" }, { status: 400 });

  const weekFolder = `uploads/client-${week.clientId}/week-${week.weekStart.toISOString().slice(0, 10)}`;
  await fs.mkdir(weekFolder, { recursive: true });

  const uploaded = [];
  for (const file of files) {
    const data = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${file.name.replaceAll(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storedPath = path.join(weekFolder, safeName);
    await fs.writeFile(storedPath, data);

    const dbFile = await prisma.uploadedFile.create({
      data: {
        clientId: week.clientId,
        reportingWeekId: weekId,
        originalName: file.name,
        storedPath,
        mimeType: file.type || null,
      }
    });
    uploaded.push(dbFile);
  }

  await prisma.reportingWeek.update({ where: { id: weekId }, data: { status: "FILES_UPLOADED" } });

  return NextResponse.json({ uploadedCount: uploaded.length, files: uploaded });
}

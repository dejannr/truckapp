import Link from "next/link";
import { DocumentsTable } from "@/components/documents/DocumentsTable";
import { AppHeader } from "@/components/layout/AppHeader";
import { requirePageRole } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";

export default async function ClientDocumentsPage() {
  const user = await requirePageRole("CLIENT");
  const clientId = user.clientId || "";

  const [client, documents, weeks] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.uploadedFile.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
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
    }),
    prisma.reportingWeek.findMany({
      where: { clientId },
      orderBy: { weekStart: "desc" },
      select: {
        id: true,
        label: true,
        weekStart: true,
        weekEnd: true,
        status: true,
      },
    }),
  ]);

  return (
    <main>
      <AppHeader title="Document List" role="CLIENT" clientName={client?.name} clientActionLabel="Workspace" clientActionHref="/client" />
      <div className="mx-auto max-w-7xl space-y-4 px-4 pb-8">
        <div className="card flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-600">Review all uploaded documents and assign each one to a week.</p>
          </div>
          <Link href="/client/upload" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">
            Upload documents
          </Link>
        </div>

        <DocumentsTable
          updateUrlBase="/api/documents"
          documents={documents.map((document) => ({
            id: document.id,
            originalName: document.originalName,
            processed: document.processed,
            createdAt: document.createdAt.toISOString(),
            reportingWeekId: document.reportingWeekId,
            reportingWeek: document.reportingWeek
              ? {
                  id: document.reportingWeek.id,
                  label: document.reportingWeek.label,
                  weekStart: document.reportingWeek.weekStart.toISOString(),
                  weekEnd: document.reportingWeek.weekEnd.toISOString(),
                }
              : null,
          }))}
          weeks={weeks.map((week) => ({
            id: week.id,
            label: week.label,
            weekStart: week.weekStart.toISOString(),
            weekEnd: week.weekEnd.toISOString(),
            status: week.status,
          }))}
        />
      </div>
    </main>
  );
}

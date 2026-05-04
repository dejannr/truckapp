import Link from "next/link";
import { DocumentsTable } from "@/components/documents/DocumentsTable";
import { AppHeader } from "@/components/layout/AppHeader";
import { prisma } from "@/lib/db/prisma";
import { requirePageRole } from "@/lib/auth/server";

export default async function AdminClientDocumentsPage({ params }: { params: Promise<{ clientId: string }> }) {
  await requirePageRole("ADMIN");
  const { clientId } = await params;

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

  if (!client) return <main className="p-6">Client not found</main>;

  return (
    <main>
      <AppHeader title="Document List" role="ADMIN" clientName={client.name} clientActionLabel="Back to client" clientActionHref={`/admin/clients/${clientId}`} />
      <div className="mx-auto max-w-7xl space-y-4 px-4 pb-8">
        <div className="card flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-600">Review uploaded documents for this client and assign them to weeks.</p>
          </div>
          <Link href={`/admin/clients/${clientId}/upload`} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">
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

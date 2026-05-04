import { DocumentsTable } from "@/components/documents/DocumentsTable";
import { AppHeader } from "@/components/layout/AppHeader";
import { getWorkspaceContext, getWorkspaceNavItems, workspaceQuery } from "@/lib/workspace";
import { prisma } from "@/lib/db/prisma";

export default async function ClientDocumentsPage({ searchParams }: { searchParams?: Promise<{ clientId?: string }> }) {
  const { client, clientId, isAdmin } = await getWorkspaceContext(searchParams);
  const query = workspaceQuery(clientId, isAdmin ? "ADMIN" : "CLIENT");

  const [documents, weeks] = await Promise.all([
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
      <AppHeader title="Document List" role={isAdmin ? "ADMIN" : "CLIENT"} clientName={client.name} navItems={getWorkspaceNavItems(isAdmin ? "ADMIN" : "CLIENT", clientId)} />
      <div className="mx-auto max-w-7xl space-y-4 px-4 pb-8">
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

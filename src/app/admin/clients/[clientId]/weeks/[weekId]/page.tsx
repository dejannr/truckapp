import { AdminWeekActions } from "@/components/dashboard/AdminWeekActions";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { UploadFilesForm } from "@/components/dashboard/UploadFilesForm";
import { AppHeader } from "@/components/layout/AppHeader";
import { prisma } from "@/lib/db/prisma";
import { requirePageRole } from "@/lib/auth/server";

export default async function AdminWeekPage({ params }: { params: Promise<{ clientId: string; weekId: string }> }) {
  await requirePageRole("ADMIN");
  const { weekId } = await params;

  const week = await prisma.reportingWeek.findUnique({
    where: { id: weekId },
    include: {
      client: true,
      uploadedFiles: { orderBy: { createdAt: "desc" } },
      sections: { orderBy: { sectionKey: "asc" } },
    }
  });
  if (!week) return <main className="p-6">Week not found</main>;

  return (
    <main>
      <AppHeader title={`Admin Week - ${week.label}`} role="ADMIN" clientName={week.client.name} />
      <div className="mx-auto max-w-7xl space-y-4 px-4 pb-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <UploadFilesForm weekId={week.id} />
          <AdminWeekActions weekId={week.id} />
        </div>

        <div className="card">
          <h2 className="mb-2 font-semibold">Uploaded Files</h2>
          <ul className="space-y-1 text-sm">
            {week.uploadedFiles.length ? week.uploadedFiles.map((f) => (
              <li key={f.id}>{f.originalName} • {f.fileType} • confidence: {Number(f.classificationConfidence || 0).toFixed(2)}</li>
            )) : <li className="text-slate-500">No files uploaded.</li>}
          </ul>
        </div>

        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">Dashboard Preview</h2>
          {week.sections.length ? <DashboardView sections={week.sections as any} /> : <p className="text-sm text-slate-600">No sections yet. Upload files and process data.</p>}
        </div>
      </div>
    </main>
  );
}

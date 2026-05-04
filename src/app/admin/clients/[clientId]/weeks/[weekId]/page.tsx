import { DashboardView } from "@/components/dashboard/DashboardView";
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
      <AppHeader title={`Weekly Report Builder - ${week.label}`} role="ADMIN" clientName={week.client.name} />
      <div className="mx-auto max-w-7xl space-y-4 px-4 pb-8">
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">Client dashboard preview</h2>
          {week.sections.length ? <DashboardView sections={week.sections as any} /> : <p className="text-sm text-slate-600">No report sections yet. Upload files and process report data.</p>}
        </div>
      </div>
    </main>
  );
}

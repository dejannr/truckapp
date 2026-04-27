import { ClientDashboardContainer } from "@/components/dashboard/ClientDashboardContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { prisma } from "@/lib/db/prisma";
import { requirePageRole } from "@/lib/auth/server";

export default async function ClientWeekDashboardPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const user = await requirePageRole("CLIENT");
  const { weekId } = await params;

  const [week, weeks] = await Promise.all([
    prisma.reportingWeek.findUnique({
      where: { id: weekId },
      include: {
        client: true,
      }
    }),
    prisma.reportingWeek.findMany({
      where: { clientId: user.clientId || "", status: "PUBLISHED" },
      orderBy: { weekStart: "desc" },
    })
  ]);

  if (!week || week.clientId !== user.clientId) return <main className="p-6">Forbidden</main>;

  return (
    <main>
      <AppHeader
        title="Weekly Fleet Report"
        role="CLIENT"
        clientName={week.client.name}
        clientActionLabel="Back to weeks"
        clientActionHref="/client/dashboard"
      />
      <div className="mx-auto max-w-7xl space-y-4 px-4 pb-10">
        <ClientDashboardContainer
          initialWeekId={week.id}
          weekOptions={weeks.map((w) => ({
            id: w.id,
            label: w.label,
            weekStart: w.weekStart.toISOString(),
            weekEnd: w.weekEnd.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}

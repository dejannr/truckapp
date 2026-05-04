import { redirect } from "next/navigation";
import { ClientDashboardContainer } from "@/components/dashboard/ClientDashboardContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { getPageUser } from "@/lib/auth/server";
import { getWorkspaceNavItems } from "@/lib/workspace";
import { prisma } from "@/lib/db/prisma";

export default async function ClientWeekDashboardPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const user = await getPageUser();
  if (!user) redirect("/login");

  const { weekId } = await params;

  const week = await prisma.reportingWeek.findUnique({
    where: { id: weekId },
    include: {
      client: true,
    },
  });

  if (!week) return <main className="p-6">Week not found</main>;
  if (user.role === "CLIENT" && week.clientId !== user.clientId) return <main className="p-6">Forbidden</main>;

  const weeks = await prisma.reportingWeek.findMany({
    where: { clientId: week.clientId, status: "PUBLISHED" },
    orderBy: { weekStart: "desc" },
  });

  return (
    <main>
      <AppHeader
        title="Weekly Fleet Report"
        role={user.role}
        clientName={week.client.name}
        navItems={getWorkspaceNavItems(user.role, week.clientId)}
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

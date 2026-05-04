import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { prisma } from "@/lib/db/prisma";
import { getWorkspaceContext, getWorkspaceNavItems, workspaceQuery } from "@/lib/workspace";

export default async function ClientDashboardWeeksPage({ searchParams }: { searchParams?: Promise<{ clientId?: string }> }) {
  const { client, clientId, isAdmin } = await getWorkspaceContext(searchParams);
  const query = workspaceQuery(clientId, isAdmin ? "ADMIN" : "CLIENT");
  const weeks = await prisma.reportingWeek.findMany({
    where: { clientId, status: "PUBLISHED" },
    orderBy: { weekStart: "desc" },
  });

  return (
    <main>
      <AppHeader title="Client Dashboard" role={isAdmin ? "ADMIN" : "CLIENT"} clientName={client.name} navItems={getWorkspaceNavItems(isAdmin ? "ADMIN" : "CLIENT", clientId)} />
      <div className="mx-auto max-w-5xl px-4 pb-8">
        <h2 className="mb-4 text-lg font-semibold">Published Weeks</h2>
        <div className="space-y-2">
          {weeks.map((week) => (
            <Link key={week.id} href={`/client/dashboard/${week.id}${query}`} className="card block hover:border-accent">
              <p className="font-medium">{week.label}</p>
              <p className="text-sm text-slate-600">{week.weekStart.toISOString().slice(0, 10)} to {week.weekEnd.toISOString().slice(0, 10)}</p>
            </Link>
          ))}
          {!weeks.length ? <p className="text-sm text-slate-600">No published weeks yet.</p> : null}
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { requirePageRole } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";

export default async function ClientDashboardWeeksPage() {
  const user = await requirePageRole("CLIENT");
  const weeks = await prisma.reportingWeek.findMany({
    where: { clientId: user.clientId || "", status: "PUBLISHED" },
    orderBy: { weekStart: "desc" },
  });
  const client = await prisma.client.findUnique({ where: { id: user.clientId || "" } });

  return (
    <main>
      <AppHeader title="Client Dashboard" role="CLIENT" clientName={client?.name} showClientAction={false} />
      <div className="mx-auto max-w-5xl px-4 pb-8">
        <h2 className="mb-4 text-lg font-semibold">Published Weeks</h2>
        <div className="space-y-2">
          {weeks.map((week) => (
            <Link key={week.id} href={`/client/dashboard/${week.id}`} className="card block hover:border-accent">
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

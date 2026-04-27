import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { CreateWeekForm } from "@/components/dashboard/CreateWeekForm";
import { prisma } from "@/lib/db/prisma";
import { requirePageRole } from "@/lib/auth/server";

export default async function AdminClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  await requirePageRole("ADMIN");
  const { clientId } = await params;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { weeks: { orderBy: { weekStart: "desc" } } },
  });

  if (!client) return <main className="p-6">Client not found</main>;

  return (
    <main>
      <AppHeader title="Admin - Client Detail" role="ADMIN" clientName={client.name} />
      <div className="mx-auto max-w-6xl p-6">
        <p className="text-sm text-slate-600">{client.slug}</p>
        <CreateWeekForm clientId={clientId} />

        <div className="mt-6 space-y-2">
          {client.weeks.map((week) => (
            <Link key={week.id} href={`/admin/clients/${clientId}/weeks/${week.id}`} className="card block hover:border-accent">
              <p className="font-medium">{week.label}</p>
              <p className="text-sm text-slate-600">Status: {week.status}</p>
            </Link>
          ))}
          {!client.weeks.length ? <p className="text-sm text-slate-600">No weeks yet.</p> : null}
        </div>
      </div>
    </main>
  );
}

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
      <AppHeader title="Client Weekly Reports" role="ADMIN" clientName={client.name} />
      <div className="mx-auto max-w-6xl p-6">
        <p className="text-sm text-slate-600">{client.slug}</p>
        <p className="text-sm text-slate-600">
          Create a reporting week, upload files, assign documents to weeks, process the report, then publish it for client view.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/admin/clients/${clientId}/upload`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50">
            Upload documents
          </Link>
          <Link href={`/admin/clients/${clientId}/documents`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50">
            Document list
          </Link>
        </div>
        <CreateWeekForm clientId={clientId} />

        <div className="mt-6 space-y-2">
          {client.weeks.map((week) => (
            <Link key={week.id} href={`/admin/clients/${clientId}/weeks/${week.id}`} className="card block hover:border-accent">
              <p className="font-medium">{week.label}</p>
              <p className="text-sm text-slate-600">Report status: {week.status}</p>
            </Link>
          ))}
          {!client.weeks.length ? <p className="text-sm text-slate-600">No weekly reports yet.</p> : null}
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { requirePageRole } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";

export default async function ClientHomePage() {
  const user = await requirePageRole("CLIENT");
  const client = await prisma.client.findUnique({
    where: { id: user.clientId || "" },
    include: {
      _count: {
        select: {
          uploads: true,
          weeks: true,
        },
      },
    },
  });

  return (
    <main>
      <AppHeader title="Client Workspace" role="CLIENT" clientName={client?.name} showClientAction={false} />
      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-8">
        <section className="grid gap-4 md:grid-cols-3">
          <Link href="/client/upload" className="card block hover:border-accent">
            <p className="text-xs uppercase tracking-wide text-slate-500">Upload</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Upload documents</h2>
            <p className="mt-2 text-sm text-slate-600">Send new files into your project inbox before assigning them to a week.</p>
          </Link>
          <Link href="/client/documents" className="card block hover:border-accent">
            <p className="text-xs uppercase tracking-wide text-slate-500">Documents</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Document list</h2>
            <p className="mt-2 text-sm text-slate-600">Review uploaded files, processing state, and week assignment.</p>
          </Link>
          <Link href="/client/dashboard" className="card block hover:border-accent">
            <p className="text-xs uppercase tracking-wide text-slate-500">Dashboards</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Weekly dashboards</h2>
            <p className="mt-2 text-sm text-slate-600">Open the published weekly analytics views for this client.</p>
          </Link>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <p className="text-xs uppercase tracking-wide text-slate-500">Project</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{client?.name ?? "Client"}</p>
            <p className="mt-2 text-sm text-slate-600">{client?.slug}</p>
          </div>
          <div className="card grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Documents</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{client?._count.uploads ?? 0}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Weeks</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{client?._count.weeks ?? 0}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

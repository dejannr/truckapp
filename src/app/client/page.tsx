import Link from "next/link";
import { CreateWeekForm } from "@/components/dashboard/CreateWeekForm";
import { AppHeader } from "@/components/layout/AppHeader";
import { getWorkspaceContext, getWorkspaceNavItems } from "@/lib/workspace";

export default async function ClientHomePage({ searchParams }: { searchParams?: Promise<{ clientId?: string }> }) {
  const { client, clientId, isAdmin } = await getWorkspaceContext(searchParams);

  return (
    <main>
      <AppHeader title="Workspace" role={isAdmin ? "ADMIN" : "CLIENT"} clientName={client.name} navItems={getWorkspaceNavItems(isAdmin ? "ADMIN" : "CLIENT", clientId)} />
      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-8">
        {isAdmin ? (
          <section className="card space-y-3">
            <p className="text-sm text-slate-600">
              Admin view for this client. Use the same workspace links as the client, plus the extra create-week controls below.
            </p>
            <CreateWeekForm clientId={clientId} />
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <Link href={`/client/upload${isAdmin ? `?clientId=${encodeURIComponent(clientId)}` : ""}`} className="card block hover:border-accent">
            <p className="text-xs uppercase tracking-wide text-slate-500">Upload</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Upload documents</h2>
            <p className="mt-2 text-sm text-slate-600">Send new files into your project inbox before assigning them to a week.</p>
          </Link>
          <Link href={`/client/documents${isAdmin ? `?clientId=${encodeURIComponent(clientId)}` : ""}`} className="card block hover:border-accent">
            <p className="text-xs uppercase tracking-wide text-slate-500">Documents</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Document list</h2>
            <p className="mt-2 text-sm text-slate-600">Review uploaded files, processing state, and week assignment.</p>
          </Link>
          <Link href={`/client/dashboard${isAdmin ? `?clientId=${encodeURIComponent(clientId)}` : ""}`} className="card block hover:border-accent">
            <p className="text-xs uppercase tracking-wide text-slate-500">Dashboards</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Weekly dashboards</h2>
            <p className="mt-2 text-sm text-slate-600">Open the published weekly analytics views for this client.</p>
          </Link>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <p className="text-xs uppercase tracking-wide text-slate-500">Project</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{client.name}</p>
            <p className="mt-2 text-sm text-slate-600">{client.slug}</p>
          </div>
          <div className="card grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Documents</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{client._count.uploads}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Weeks</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{client._count.weeks}</p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Weeks</h2>
          <div className="space-y-2">
            {client.weeks.map((week) => (
              <Link
                key={week.id}
                href={`/client/dashboard/${week.id}${isAdmin ? `?clientId=${encodeURIComponent(clientId)}` : ""}`}
                className="card block hover:border-accent"
              >
                <p className="font-medium">{week.label}</p>
                <p className="text-sm text-slate-600">Report status: {week.status}</p>
              </Link>
            ))}
            {!client.weeks.length ? <p className="text-sm text-slate-600">No weekly reports yet.</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

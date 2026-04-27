import Link from "next/link";
import { LogoutButton } from "@/components/layout/LogoutButton";

const dashboardActionClass = "inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2";
const clientsActionClass = "inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2";

export function AppHeader({
  title,
  role,
  clientName,
  clientActionLabel = "Dashboard",
  clientActionHref = "/client/dashboard",
  showClientAction = true,
}: {
  title: string;
  role: "ADMIN" | "CLIENT";
  clientName?: string;
  clientActionLabel?: string;
  clientActionHref?: string;
  showClientAction?: boolean;
}) {
  return (
    <header className="mb-6 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/70">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Trucking Analytics</p>
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            {clientName ? <p className="text-sm text-slate-600">{clientName}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {role === "ADMIN" ? <Link href="/admin/clients" className={clientsActionClass}>Clients</Link> : null}
            {role === "CLIENT" && showClientAction ? <Link href={clientActionHref} className={dashboardActionClass}>{clientActionLabel}</Link> : null}
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}

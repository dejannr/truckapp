import Link from "next/link";
import { LogoutButton } from "@/components/layout/LogoutButton";

const dashboardActionClass = "inline-flex h-9 items-center rounded-lg px-3 text-sm text-slate-800 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2";

export function AppHeader({
  title,
  role,
  clientName,
}: {
  title: string;
  role: "ADMIN" | "CLIENT";
  clientName?: string;
}) {
  return (
    <header className="mb-6 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Trucking Analytics</p>
          <h1 className="text-lg font-semibold">{title}</h1>
          {clientName ? <p className="text-sm text-slate-600">{clientName}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          {role === "ADMIN" ? <Link href="/admin/clients" className="text-sm text-accent">Clients</Link> : null}
          {role === "CLIENT" ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/client/dashboard"
                className={dashboardActionClass}
              >
                Dashboard
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <LogoutButton />
          )}
        </div>
      </div>
    </header>
  );
}

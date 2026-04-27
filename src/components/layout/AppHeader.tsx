import Link from "next/link";
import { LogoutButton } from "@/components/layout/LogoutButton";

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
          {role === "CLIENT" ? <Link href="/client/dashboard" className="text-sm text-accent">Dashboard</Link> : null}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

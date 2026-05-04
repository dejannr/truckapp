"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/layout/LogoutButton";

type NavItem = {
  href: string;
  label: string;
};

export function AppHeader({
  title,
  role,
  clientName,
  navItems,
}: {
  title: string;
  role: "ADMIN" | "CLIENT";
  clientName?: string;
  navItems?: NavItem[];
}) {
  const pathname = usePathname();
  const items = navItems ?? (role === "ADMIN"
    ? [{ href: "/admin/clients", label: "Clients" }]
    : [
        { href: "/client", label: "Workspace" },
        { href: "/client/upload", label: "Upload" },
        { href: "/client/documents", label: "Documents" },
        { href: "/client/dashboard", label: "Dashboards" },
      ]);

  function isActive(href: string) {
    if (href.includes("#")) {
      return false;
    }
    const baseHref = href.split("#")[0].split("?")[0];
    if (baseHref === "/client/dashboard") {
      return pathname === "/client/dashboard" || pathname.startsWith("/client/dashboard/");
    }
    return pathname === baseHref;
  }

  return (
    <header className="sticky top-0 z-20 mb-6 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center gap-4">
          <Link
            href={role === "ADMIN" ? "/admin/clients" : "/client"}
            className="flex-shrink-0 text-lg font-semibold tracking-tight text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            TruckA
          </Link>

          <div className="min-w-0 flex-1">
            <nav aria-label="Primary" className="flex items-center justify-center gap-1 overflow-x-auto">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex-shrink-0">
            <LogoutButton />
          </div>
        </div>
      </div>
      <span className="sr-only">{title}{clientName ? ` ${clientName}` : ""}</span>
    </header>
  );
}

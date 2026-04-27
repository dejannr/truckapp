import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { prisma } from "@/lib/db/prisma";
import { requirePageRole } from "@/lib/auth/server";

export default async function AdminClientsPage() {
  await requirePageRole("ADMIN");
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { weeks: true } } }
  });

  return (
    <main>
      <AppHeader title="Admin - Clients" role="ADMIN" />
      <div className="mx-auto max-w-7xl space-y-4 px-4 pb-8">
        <div className="flex justify-end">
          <Link href="/admin/clients/new" className="rounded bg-accent px-3 py-2 text-sm text-white">New Client</Link>
        </div>
        {clients.map((client) => (
          <Link href={`/admin/clients/${client.id}`} key={client.id} className="card block hover:border-accent">
            <h3 className="font-semibold">{client.name}</h3>
            <p className="text-sm text-slate-600">{client.slug} • Weeks: {client._count.weeks}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

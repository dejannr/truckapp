import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getPageUser } from "@/lib/auth/server";

type WorkspaceRole = "ADMIN" | "CLIENT";

function clientQuery(clientId: string | null | undefined, role: WorkspaceRole) {
  return role === "ADMIN" && clientId ? `?clientId=${encodeURIComponent(clientId)}` : "";
}

export async function getWorkspaceContext(searchParams?: Promise<{ clientId?: string }> | { clientId?: string }) {
  const user = await getPageUser();
  if (!user) redirect("/login");

  const resolvedParams = await Promise.resolve(searchParams);
  const requestedClientId = typeof resolvedParams?.clientId === "string" && resolvedParams.clientId ? resolvedParams.clientId : null;
  const clientId = user.role === "ADMIN" ? requestedClientId : user.clientId;

  if (!clientId) {
    redirect(user.role === "ADMIN" ? "/admin/clients" : "/client");
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      _count: {
        select: {
          uploads: true,
          weeks: true,
        },
      },
      weeks: {
        orderBy: { weekStart: "desc" },
      },
    },
  });

  if (!client) {
    redirect(user.role === "ADMIN" ? "/admin/clients" : "/client");
  }

  return {
    user,
    client,
    clientId,
    isAdmin: user.role === "ADMIN",
  };
}

export function getWorkspaceNavItems(role: WorkspaceRole, clientId: string | null | undefined) {
  const query = clientQuery(clientId, role);
  return [
    ...(role === "ADMIN" ? [{ href: "/admin/clients", label: "Clients" }] : []),
    { href: `/client${query}`, label: "Workspace" },
    { href: `/client/upload${query}`, label: "Upload" },
    { href: `/client/documents${query}`, label: "Documents" },
    { href: `/client/dashboard${query}`, label: "Dashboards" },
  ];
}

export function workspaceQuery(clientId: string | null | undefined, role: WorkspaceRole) {
  return clientQuery(clientId, role);
}

import Link from "next/link";
import { UploadFilesForm } from "@/components/dashboard/UploadFilesForm";
import { AppHeader } from "@/components/layout/AppHeader";
import { getWorkspaceContext, getWorkspaceNavItems, workspaceQuery } from "@/lib/workspace";

export default async function ClientUploadPage({ searchParams }: { searchParams?: Promise<{ clientId?: string }> }) {
  const { client, clientId, isAdmin } = await getWorkspaceContext(searchParams);
  const query = workspaceQuery(clientId, isAdmin ? "ADMIN" : "CLIENT");

  return (
    <main>
      <AppHeader title="Upload Documents" role={isAdmin ? "ADMIN" : "CLIENT"} clientName={client.name} navItems={getWorkspaceNavItems(isAdmin ? "ADMIN" : "CLIENT", clientId)} />
      <div className="mx-auto max-w-4xl space-y-4 px-4 pb-8">
        <div className="card space-y-3">
          <p className="text-sm text-slate-600">
            Upload documents into the client inbox first. After that, assign them to a week from the document list.
          </p>
          <Link href={`/client/documents${query}`} className="text-sm font-medium text-blue-700 hover:underline">
            Go to document list
          </Link>
        </div>
        <UploadFilesForm
          uploadUrl="/api/documents/upload"
          clientId={isAdmin ? clientId : undefined}
          title="Upload files"
          description="Supported examples: load exports, fuel reports, maintenance, drivers, and truck files."
          buttonLabel="Upload documents"
        />
      </div>
    </main>
  );
}

import Link from "next/link";
import { UploadFilesForm } from "@/components/dashboard/UploadFilesForm";
import { AppHeader } from "@/components/layout/AppHeader";
import { prisma } from "@/lib/db/prisma";
import { requirePageRole } from "@/lib/auth/server";

export default async function AdminClientUploadPage({ params }: { params: Promise<{ clientId: string }> }) {
  await requirePageRole("ADMIN");
  const { clientId } = await params;

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return <main className="p-6">Client not found</main>;

  return (
    <main>
      <AppHeader title="Upload Documents" role="ADMIN" clientName={client.name} clientActionLabel="Back to client" clientActionHref={`/admin/clients/${clientId}`} />
      <div className="mx-auto max-w-4xl space-y-4 px-4 pb-8">
        <div className="card space-y-3">
          <p className="text-sm text-slate-600">
            Upload documents into the client inbox. They stay unassigned until you link them to a week from the document list.
          </p>
          <Link href={`/admin/clients/${clientId}/documents`} className="text-sm font-medium text-blue-700 hover:underline">
            Go to document list
          </Link>
        </div>
        <UploadFilesForm
          uploadUrl="/api/documents/upload"
          clientId={clientId}
          title="Upload files"
          description="Supported examples: load exports, fuel reports, maintenance, drivers, and truck files."
          buttonLabel="Upload documents"
        />
      </div>
    </main>
  );
}

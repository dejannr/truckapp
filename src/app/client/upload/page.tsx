import Link from "next/link";
import { UploadFilesForm } from "@/components/dashboard/UploadFilesForm";
import { AppHeader } from "@/components/layout/AppHeader";
import { requirePageRole } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";

export default async function ClientUploadPage() {
  const user = await requirePageRole("CLIENT");
  const client = await prisma.client.findUnique({ where: { id: user.clientId || "" } });

  return (
    <main>
      <AppHeader title="Upload Documents" role="CLIENT" clientName={client?.name} clientActionLabel="Workspace" clientActionHref="/client" />
      <div className="mx-auto max-w-4xl space-y-4 px-4 pb-8">
        <div className="card space-y-3">
          <p className="text-sm text-slate-600">
            Upload documents into the client inbox first. After that, assign them to a week from the document list.
          </p>
          <Link href="/client/documents" className="text-sm font-medium text-blue-700 hover:underline">
            Go to document list
          </Link>
        </div>
        <UploadFilesForm
          uploadUrl="/api/documents/upload"
          title="Upload files"
          description="Supported examples: load exports, fuel reports, maintenance, drivers, and truck files."
          buttonLabel="Upload documents"
        />
      </div>
    </main>
  );
}

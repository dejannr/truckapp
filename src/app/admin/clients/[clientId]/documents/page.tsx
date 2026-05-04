import { redirect } from "next/navigation";
import { requirePageRole } from "@/lib/auth/server";

export default async function AdminClientDocumentsPage({ params }: { params: Promise<{ clientId: string }> }) {
  await requirePageRole("ADMIN");
  const { clientId } = await params;
  redirect(`/client/documents?clientId=${clientId}`);
}

import { redirect } from "next/navigation";
import { requirePageRole } from "@/lib/auth/server";

export default async function AdminWeekPage({ params }: { params: Promise<{ clientId: string; weekId: string }> }) {
  await requirePageRole("ADMIN");
  const { clientId, weekId } = await params;
  redirect(`/client/dashboard/${weekId}?clientId=${clientId}`);
}

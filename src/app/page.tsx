import { redirect } from "next/navigation";
import { getPageUser } from "@/lib/auth/server";

export default async function HomePage() {
  const user = await getPageUser();
  if (!user) redirect("/login");
  redirect(user.role === "ADMIN" ? "/admin/clients" : "/client/dashboard");
}

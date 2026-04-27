import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export async function requirePageRole(role: "ADMIN" | "CLIENT") {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== role) {
    if (user.role === "ADMIN") redirect("/admin");
    redirect("/client");
  }
  return user;
}

export async function getPageUser() {
  return getSessionUser();
}

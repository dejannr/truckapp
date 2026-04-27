import { redirect } from "next/navigation";
import { LoginForm } from "@/components/layout/LoginForm";
import { getPageUser } from "@/lib/auth/server";

export default async function LoginPage() {
  const user = await getPageUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin/clients" : "/client/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}

"use client";

import { useRouter } from "next/navigation";

const authActionClass = "h-9 rounded-lg bg-slate-800 px-3 text-sm text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      className={authActionClass}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      type="button"
    >
      Logout
    </button>
  );
}

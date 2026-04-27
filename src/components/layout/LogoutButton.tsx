"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      className="rounded bg-slate-800 px-3 py-2 text-sm text-white"
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

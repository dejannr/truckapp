"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <form
      className="card w-full max-w-md space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        setLoading(false);
        if (!res.ok) {
          setError(json.error || "Login failed");
          return;
        }
        router.push(json.user.role === "ADMIN" ? "/admin/clients" : "/client/dashboard");
        router.refresh();
      }}
    >
      <div>
        <label className="mb-1 block text-sm">Email</label>
        <input className="w-full rounded border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-sm">Password</label>
        <input className="w-full rounded border px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      <button className="w-full rounded bg-accent px-3 py-2 text-white" disabled={loading} type="submit">
        {loading ? "Logging in..." : "Login"}
      </button>
      <p className="text-xs text-slate-500">Demo: admin@test.com/admin123 or client@test.com/client123</p>
    </form>
  );
}

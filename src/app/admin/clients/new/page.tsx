"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-xl font-semibold">Create Client</h1>
      <form
        className="card space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          const res = await fetch("/api/admin/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, contactName }),
          });
          const json = await res.json();
          if (!res.ok) {
            setError(json.error || "Failed");
            return;
          }
          router.push(`/admin/clients/${json.client.id}`);
          router.refresh();
        }}
      >
        <input className="w-full rounded border px-3 py-2" placeholder="Client name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full rounded border px-3 py-2" placeholder="Client email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" placeholder="Contact name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <button className="rounded bg-accent px-3 py-2 text-white" type="submit">Create</button>
      </form>
    </main>
  );
}

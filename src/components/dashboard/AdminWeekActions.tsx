"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminWeekActions({ weekId }: { weekId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(endpoint: string, label: string) {
    setBusy(label);
    setMessage(null);
    const res = await fetch(endpoint, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setMessage(json.error || `${label} failed`);
      return;
    }
    if (json.result?.warnings?.length) {
      setMessage(`Warnings: ${json.result.warnings.join(" | ")}`);
    } else {
      setMessage(`${label} completed`);
    }
    router.refresh();
  }

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className="rounded bg-accent px-3 py-2 text-sm text-white" disabled={!!busy} onClick={() => run(`/api/admin/weeks/${weekId}/process`, "Process Data")} type="button">Process Data</button>
        <button className="rounded bg-slate-700 px-3 py-2 text-sm text-white" disabled={!!busy} onClick={() => run(`/api/admin/weeks/${weekId}/generate-narratives`, "Generate Narratives")} type="button">Generate Narratives</button>
        <button className="rounded bg-green-700 px-3 py-2 text-sm text-white" disabled={!!busy} onClick={() => run(`/api/admin/weeks/${weekId}/publish`, "Publish")} type="button">Publish</button>
      </div>
      {busy ? <p className="text-sm text-slate-500">Running: {busy}</p> : null}
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}

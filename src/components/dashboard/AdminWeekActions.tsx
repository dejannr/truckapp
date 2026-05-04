"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

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
        <Button disabled={!!busy} onClick={() => run(`/api/admin/weeks/${weekId}/process`, "Process report data")} type="button">Process report data</Button>
        <Button variant="secondary" disabled={!!busy} onClick={() => run(`/api/admin/weeks/${weekId}/generate-narratives`, "Generate weekly explanation")} type="button">Generate weekly explanation</Button>
        <Button variant="primary" disabled={!!busy} onClick={() => run(`/api/admin/weeks/${weekId}/publish`, "Publish report")} type="button">Publish report</Button>
      </div>
      {busy ? <p className="text-sm text-slate-500">Running: {busy}</p> : null}
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}

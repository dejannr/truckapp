"use client";

import { useState } from "react";

export function CreateWeekForm({ clientId }: { clientId: string }) {
  const [weekStart, setWeekStart] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="card mt-4 flex flex-wrap items-end gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const res = await fetch(`/api/admin/clients/${clientId}/weeks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weekStart }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Failed to create week");
          return;
        }
        window.location.href = `/admin/clients/${clientId}/weeks/${json.week.id}`;
      }}
    >
      <label className="text-sm">
        Week Start
        <input type="date" className="ml-2 rounded border px-3 py-2" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} required />
      </label>
      <button className="rounded bg-accent px-3 py-2 text-white" type="submit">Create Week</button>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
    </form>
  );
}

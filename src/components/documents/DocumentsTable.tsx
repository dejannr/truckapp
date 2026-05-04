"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type WeekOption = {
  id: string;
  label: string;
  weekStart: string;
  weekEnd: string;
  status: string;
};

type DocumentItem = {
  id: string;
  originalName: string;
  processed: boolean;
  createdAt: string;
  reportingWeekId: string | null;
  reportingWeek: {
    id: string;
    label: string;
    weekStart: string;
    weekEnd: string;
  } | null;
};

export function DocumentsTable({
  documents,
  weeks,
  updateUrlBase,
}: {
  documents: DocumentItem[];
  weeks: WeekOption[];
  updateUrlBase: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
        <p className="text-sm text-slate-600">Assign each document to a week when you know where it belongs.</p>
      </div>
      <div className="divide-y divide-slate-200">
        {documents.map((document) => (
          <DocumentRow key={document.id} document={document} updateUrlBase={updateUrlBase} weeks={weeks} />
        ))}
        {!documents.length ? <div className="px-4 py-6 text-sm text-slate-600">No documents uploaded yet.</div> : null}
      </div>
    </div>
  );
}

function DocumentRow({
  document,
  weeks,
  updateUrlBase,
}: {
  document: DocumentItem;
  weeks: WeekOption[];
  updateUrlBase: string;
}) {
  const router = useRouter();
  const [selectedWeekId, setSelectedWeekId] = useState(document.reportingWeekId ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] md:items-center"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        const res = await fetch(`${updateUrlBase}/${document.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportingWeekId: selectedWeekId || null }),
        });
        const json = await res.json().catch(() => ({}));
        setSaving(false);
        if (!res.ok) {
          setMessage(json.error || "Failed to update document");
          return;
        }
        setMessage("Saved");
        router.refresh();
      }}
    >
      <div className="space-y-1">
        <p className="font-medium text-slate-900">{document.originalName}</p>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className={`rounded-full px-2 py-1 ${document.processed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {document.processed ? "Processed" : "Pending"}
          </span>
          <span>Uploaded {new Date(document.createdAt).toLocaleString()}</span>
          <span>Current week: {document.reportingWeek?.label ?? "Unassigned"}</span>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Assign week</span>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          value={selectedWeekId}
          onChange={(e) => setSelectedWeekId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {weeks.map((week) => (
            <option key={week.id} value={week.id}>
              {week.label} ({week.status})
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col items-start gap-2 md:items-end">
        <Button disabled={saving} size="sm" type="submit" variant="secondary">
          {saving ? "Saving..." : "Save"}
        </Button>
        {message ? <p className="text-xs text-slate-600">{message}</p> : null}
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
  createdAt: string;
  reportingWeekId: string | null;
  needsProcessing: boolean;
  reportingWeek: {
    id: string;
    label: string;
    weekStart: string;
    weekEnd: string;
  } | null;
  processingStatus: "unprocessed" | "processing" | "processed" | "failed";
  processingError: string | null;
  processedAt: string | null;
  contentType: "plain_text" | "markdown" | null;
};

function isPending(document: DocumentItem) {
  return document.needsProcessing;
}

function formatStatus(status: DocumentItem["processingStatus"]) {
  switch (status) {
    case "processed":
      return "Processed";
    case "processing":
      return "Processing";
    case "failed":
      return "Failed";
    default:
      return "Unprocessed";
  }
}

export function DocumentsTable({
  documents,
  weeks,
  updateUrlBase,
}: {
  documents: DocumentItem[];
  weeks: WeekOption[];
  updateUrlBase: string;
}) {
  const router = useRouter();
  const pendingDocuments = useMemo(() => documents.filter(isPending), [documents]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchDone, setBatchDone] = useState(0);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);

  async function processDocument(documentId: string) {
    const res = await fetch(`${updateUrlBase}/${documentId}/process`, {
      method: "POST",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.error || "Processing failed");
    }
    return json.result as { status: "processed" | "failed"; error: string | null };
  }

  async function processAll() {
    setBatchRunning(true);
    setBatchDone(0);
    setBatchMessage(null);
    setBatchError(null);

    let completed = 0;
    let failed = 0;

    for (const document of pendingDocuments) {
      try {
        const result = await processDocument(document.id);
        if (result.status === "failed") {
          failed += 1;
          setBatchError(result.error || "Processing failed");
        }
      } catch (error) {
        failed += 1;
        setBatchError(error instanceof Error ? error.message : "Processing failed");
      } finally {
        completed += 1;
        setBatchDone(completed);
      }
    }

    setBatchRunning(false);
    setBatchMessage(
      failed ? `Processed ${pendingDocuments.length - failed} document(s), ${failed} failed.` : `Processed ${pendingDocuments.length} document(s).`
    );
    router.refresh();
  }

  const progressPercent = pendingDocuments.length ? Math.round((batchDone / pendingDocuments.length) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
            <p className="text-sm text-slate-600">Assign each document to a week when you know where it belongs.</p>
          </div>
          <Button disabled={batchRunning || !pendingDocuments.length} onClick={processAll} type="button" variant="primary">
            {batchRunning ? "Processing..." : "Process all unprocessed documents"}
          </Button>
        </div>

        <div className="mt-3 space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
            <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${batchRunning ? progressPercent : pendingDocuments.length ? 100 : 0}%` }} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>{batchRunning ? `Processing ${batchDone}/${pendingDocuments.length}` : `${pendingDocuments.length} document(s) need processing`}</span>
            {batchMessage ? <span>{batchMessage}</span> : null}
          </div>
          {batchError ? <p className="text-xs text-red-700">{batchError}</p> : null}
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {documents.map((document) => (
          <DocumentRow
            key={document.id}
            document={document}
            updateUrlBase={updateUrlBase}
            weeks={weeks}
            setSavingId={setSavingId}
            savingId={savingId}
          />
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
  savingId,
  setSavingId,
}: {
  document: DocumentItem;
  weeks: WeekOption[];
  updateUrlBase: string;
  savingId: string | null;
  setSavingId: (id: string | null) => void;
}) {
  const router = useRouter();
  const [selectedWeekId, setSelectedWeekId] = useState(document.reportingWeekId ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const status = document.processingStatus || "unprocessed";

  const statusClass =
    status === "processed"
      ? "bg-emerald-100 text-emerald-700"
      : status === "processing"
        ? "bg-blue-100 text-blue-700"
        : status === "failed"
          ? "bg-red-100 text-red-700"
          : "bg-amber-100 text-amber-700";

  return (
    <form
      className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] md:items-center"
      onSubmit={async (e) => {
        e.preventDefault();
        setSavingId(document.id);
        setMessage(null);
        const res = await fetch(`${updateUrlBase}/${document.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportingWeekId: selectedWeekId || null }),
        });
        const json = await res.json().catch(() => ({}));
        setSavingId(null);
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
          <span className={`rounded-full px-2 py-1 ${statusClass}`}>{formatStatus(status)}</span>
          <span>Uploaded {new Date(document.createdAt).toLocaleString()}</span>
          <span>Current week: {document.reportingWeek?.label ?? "Unassigned"}</span>
          {document.contentType ? <span>Content: {document.contentType}</span> : null}
          {document.processedAt ? <span>Processed {new Date(document.processedAt).toLocaleString()}</span> : null}
        </div>
        {document.processingError ? <p className="text-xs text-red-700">{document.processingError}</p> : null}
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
        <Button disabled={savingId === document.id} size="sm" type="submit" variant="secondary">
          {savingId === document.id ? "Saving..." : "Save"}
        </Button>
        {message ? <p className="text-xs text-slate-600">{message}</p> : null}
      </div>
    </form>
  );
}

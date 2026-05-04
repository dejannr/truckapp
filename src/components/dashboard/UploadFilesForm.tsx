"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function UploadFilesForm({
  uploadUrl,
  title,
  description,
  clientId,
  weekOptions,
  buttonLabel = "Upload files",
}: {
  uploadUrl: string;
  title: string;
  description: string;
  clientId?: string;
  weekOptions: { id: string; label: string; weekStart: string; weekEnd: string; status: string }[];
  buttonLabel?: string;
}) {
  const router = useRouter();
  const [files, setFiles] = useState<FileList | null>(null);
  const [selectedWeekId, setSelectedWeekId] = useState(weekOptions[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedWeek = weekOptions.find((week) => week.id === selectedWeekId);

  return (
    <form
      className="card space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!files?.length) return;
        if (!selectedWeekId) {
          setMessage("Select a reporting week first.");
          return;
        }
        setLoading(true);
        setMessage(null);
        const form = new FormData();
        if (clientId) {
          form.append("clientId", clientId);
        }
        form.append("reportingWeekId", selectedWeekId);
        Array.from(files).forEach((file) => form.append("files", file));
        const res = await fetch(uploadUrl, {
          method: "POST",
          body: form,
        });
        const json = await res.json().catch(() => ({}));
        setLoading(false);
        if (!res.ok) {
          setMessage(json.error || "Upload failed");
          return;
        }
        setMessage(`Uploaded ${json.uploadedCount} file(s).`);
        router.refresh();
      }}
      >
      <label className="block text-sm font-medium">{title}</label>
      <p className="text-xs text-slate-600">{description}</p>
      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Reporting week</span>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          value={selectedWeekId}
          onChange={(e) => setSelectedWeekId(e.target.value)}
        >
          {!weekOptions.length ? <option value="">No weeks available</option> : null}
          {weekOptions.map((week) => (
            <option key={week.id} value={week.id}>
              {week.label} ({week.status})
            </option>
          ))}
        </select>
      </label>
      {selectedWeek ? (
        <p className="text-xs text-slate-500">
          Files uploaded here will be attached to {selectedWeek.label}.
        </p>
      ) : null}
      <input className="w-full" multiple onChange={(e) => setFiles(e.target.files)} type="file" />
      <Button variant="secondary" disabled={loading || !weekOptions.length} type="submit">
        {loading ? "Uploading..." : buttonLabel}
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}

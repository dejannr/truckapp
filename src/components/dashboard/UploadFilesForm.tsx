"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function UploadFilesForm({ weekId }: { weekId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="card space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!files?.length) return;
        setLoading(true);
        setMessage(null);
        const form = new FormData();
        Array.from(files).forEach((file) => form.append("files", file));
        const res = await fetch(`/api/admin/weeks/${weekId}/upload`, {
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
      <label className="block text-sm font-medium">Upload weekly files</label>
      <p className="text-xs text-slate-600">Supported examples: load exports, fuel reports, maintenance, drivers, and truck files.</p>
      <input className="w-full" multiple onChange={(e) => setFiles(e.target.files)} type="file" />
      <Button variant="secondary" disabled={loading} type="submit">
        {loading ? "Uploading..." : "Upload files"}
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}

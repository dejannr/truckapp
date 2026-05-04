"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function UploadFilesForm({
  uploadUrl,
  title,
  description,
  clientId,
  buttonLabel = "Upload files",
}: {
  uploadUrl: string;
  title: string;
  description: string;
  clientId?: string;
  buttonLabel?: string;
}) {
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
        if (clientId) {
          form.append("clientId", clientId);
        }
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
      <input className="w-full" multiple onChange={(e) => setFiles(e.target.files)} type="file" />
      <Button variant="secondary" disabled={loading} type="submit">
        {loading ? "Uploading..." : buttonLabel}
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}

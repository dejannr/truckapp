import fs from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";

export type ParsedFile = {
  uploadedFileId: string;
  originalName: string;
  storedPath: string;
  mimeType: string | null;
  sheetNames: string[];
  columns: string[];
  rows: Record<string, unknown>[];
};

function normalizeRows(rows: unknown[]): Record<string, unknown>[] {
  return rows
    .filter((row) => typeof row === "object" && row !== null)
    .map((row) => {
      const obj = row as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [String(k).trim(), v])
      );
    });
}

export async function parseUploadedFiles(
  files: { id: string; originalName: string; storedPath: string; mimeType: string | null }[]
): Promise<ParsedFile[]> {
  const output: ParsedFile[] = [];

  for (const file of files) {
    const ext = path.extname(file.originalName).toLowerCase();
    const absPath = path.resolve(file.storedPath);
    try {
      if ([".xlsx", ".xls", ".csv"].includes(ext)) {
        const wb = XLSX.readFile(absPath, { cellDates: true });
        const firstSheet = wb.SheetNames[0];
        const rows = normalizeRows(XLSX.utils.sheet_to_json(wb.Sheets[firstSheet]));
        const columns = rows.length ? Object.keys(rows[0]) : [];
        output.push({
          uploadedFileId: file.id,
          originalName: file.originalName,
          storedPath: file.storedPath,
          mimeType: file.mimeType,
          sheetNames: wb.SheetNames,
          columns,
          rows,
        });
        continue;
      }

      if (ext === ".json") {
        const content = await fs.readFile(absPath, "utf8");
        const parsed = JSON.parse(content);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        const rows = normalizeRows(arr);
        const columns = rows.length ? Object.keys(rows[0]) : [];
        output.push({
          uploadedFileId: file.id,
          originalName: file.originalName,
          storedPath: file.storedPath,
          mimeType: file.mimeType,
          sheetNames: [],
          columns,
          rows,
        });
        continue;
      }

      const content = await fs.readFile(absPath, "utf8");
      const rows = content
        .split("\n")
        .slice(0, 50)
        .map((line, i) => ({ row: i + 1, raw: line }));
      output.push({
        uploadedFileId: file.id,
        originalName: file.originalName,
        storedPath: file.storedPath,
        mimeType: file.mimeType,
        sheetNames: [],
        columns: ["raw"],
        rows,
      });
    } catch {
      output.push({
        uploadedFileId: file.id,
        originalName: file.originalName,
        storedPath: file.storedPath,
        mimeType: file.mimeType,
        sheetNames: [],
        columns: [],
        rows: [],
      });
    }
  }

  return output;
}

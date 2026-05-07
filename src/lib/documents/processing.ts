import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db/prisma";
import type { ContentType, ProcessingStatus, UploadedFile } from "@prisma/client";
import * as XLSX from "xlsx";

export type ProcessedDocumentResult = {
  documentId: string;
  status: ProcessingStatus;
  contentType: ContentType | null;
  contentLength: number;
  error: string | null;
};

type ExtractedContent = {
  content: string;
  contentType: ContentType;
};

function isSupportedExtension(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  return [".txt", ".md", ".csv", ".xlsx", ".docx", ".pdf", ".json"].includes(ext);
}

function normalizeCell(value: unknown) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function escapeMarkdownCell(value: string) {
  return value.replaceAll("|", "\\|").replaceAll("\n", "<br />").replaceAll("\r", "");
}

function rowsToMarkdownTable(rows: unknown[][]) {
  const normalized = rows
    .map((row) => row.map((cell) => escapeMarkdownCell(normalizeCell(cell).trim())))
    .filter((row) => row.some((cell) => cell.length > 0));

  if (!normalized.length) return "";

  const header = normalized[0].map((cell, index) => cell || `Column ${index + 1}`);
  const body = normalized.slice(1);
  const width = header.length;
  const paddedBody = body.map((row) => {
    const copy = [...row];
    while (copy.length < width) copy.push("");
    return copy.slice(0, width);
  });

  const headerRow = `| ${header.join(" | ")} |`;
  const dividerRow = `| ${header.map(() => "---").join(" | ")} |`;
  const bodyRows = paddedBody.map((row) => `| ${row.join(" | ")} |`);
  return [headerRow, dividerRow, ...bodyRows].join("\n");
}

function sheetToMarkdown(sheet: XLSX.WorkSheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
    raw: false,
  }) as unknown[][];

  const markdownTable = rowsToMarkdownTable(rows);
  return markdownTable || "_No visible rows found._";
}

function recordToMarkdownTable(records: Record<string, unknown>[]) {
  if (!records.length) return "";

  const keys = Array.from(new Set(records.flatMap((record) => Object.keys(record))));
  const rows = [
    keys,
    ...records.map((record) => keys.map((key) => normalizeCell(record[key]))),
  ];

  return rowsToMarkdownTable(rows);
}

function jsonValueToMarkdown(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
      const records = value as Record<string, unknown>[];
      const table = recordToMarkdownTable(records);
      return table || "_No visible rows found._";
    }

    const rows = value.map((item) => [normalizeCell(item)]);
    return rowsToMarkdownTable([["value"], ...rows]) || "_No visible rows found._";
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalizeCell(item)]);
    return rowsToMarkdownTable([["key", "value"], ...entries]) || "_No visible rows found._";
  }

  return normalizeCell(value);
}

async function extractFromPdf(absPath: string): Promise<string> {
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = (pdfParseModule as { default?: (buffer: Buffer) => Promise<{ text: string }> }).default ?? (pdfParseModule as unknown as (buffer: Buffer) => Promise<{ text: string }>);
  const buffer = await fs.readFile(absPath);
  const result = await pdfParse(buffer);
  return result.text.trim();
}

async function extractFromDocx(absPath: string): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ path: absPath });
  return result.value.trim();
}

export async function extractContentFromFile(
  filePath: string,
  fileName: string,
  mimeType?: string
): Promise<ExtractedContent> {
  const ext = path.extname(fileName).toLowerCase();
  const absPath = path.resolve(filePath);

  if (!isSupportedExtension(fileName)) {
    throw new Error(`Unsupported document type: ${ext || mimeType || fileName}`);
  }

  if (ext === ".txt" || ext === ".md") {
    const content = (await fs.readFile(absPath, "utf8")).trim();
    return { content, contentType: ext === ".md" ? "markdown" : "plain_text" };
  }

  if (ext === ".docx") {
    const content = await extractFromDocx(absPath);
    return { content, contentType: "plain_text" };
  }

  if (ext === ".pdf") {
    const content = await extractFromPdf(absPath);
    return { content, contentType: "plain_text" };
  }

  if (ext === ".csv" || ext === ".xlsx") {
    const workbook = XLSX.readFile(absPath, { cellDates: true });
    const sections = workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      return `## ${sheetName}\n\n${sheetToMarkdown(sheet)}`;
    });
    const content = sections.join("\n\n").trim();
    return { content, contentType: "markdown" };
  }

  if (ext === ".json") {
    const raw = await fs.readFile(absPath, "utf8");
    const parsed = JSON.parse(raw);
    const content = jsonValueToMarkdown(parsed).trim();
    return { content, contentType: "markdown" };
  }

  throw new Error(`Unsupported document type: ${ext || mimeType || fileName}`);
}

export function documentNeedsProcessing(document: Pick<UploadedFile, "content" | "processingStatus">) {
  return !document.content?.trim() || document.processingStatus === "unprocessed" || document.processingStatus === "failed";
}

export async function processDocument(documentId: string): Promise<ProcessedDocumentResult> {
  const document = await prisma.uploadedFile.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  await prisma.uploadedFile.update({
    where: { id: documentId },
    data: {
      processingStatus: "processing",
      processingError: null,
      processed: false,
    },
  });

  try {
    const extracted = await extractContentFromFile(document.storedPath, document.originalName, document.mimeType || undefined);
    if (!extracted.content.trim()) {
      throw new Error("No extractable content found in document");
    }

    const updated = await prisma.uploadedFile.update({
      where: { id: documentId },
      data: {
        content: extracted.content,
        contentType: extracted.contentType,
        processingStatus: "processed",
        processingError: null,
        processedAt: new Date(),
        processed: true,
      },
    });

    return {
      documentId,
      status: updated.processingStatus,
      contentType: updated.contentType,
      contentLength: updated.content?.length || 0,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to extract document content";
    await prisma.uploadedFile.update({
      where: { id: documentId },
      data: {
        content: null,
        contentType: null,
        processingStatus: "failed",
        processingError: message,
        processedAt: null,
        processed: false,
      },
    });

    return {
      documentId,
      status: "failed",
      contentType: null,
      contentLength: 0,
      error: message,
    };
  }
}

export async function processAllUnprocessedDocuments(clientId?: string): Promise<void> {
  const documents = await prisma.uploadedFile.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      OR: [
        { content: null },
        { content: "" },
        { processingStatus: "unprocessed" },
        { processingStatus: "failed" },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  for (const document of documents) {
    await processDocument(document.id);
  }
}

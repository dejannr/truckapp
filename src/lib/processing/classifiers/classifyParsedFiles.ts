import { UploadedFileType } from "@prisma/client";
import type { ParsedFile } from "@/lib/processing/parsers/parseUploadedFiles";

export type ClassifiedFile = ParsedFile & {
  fileType: UploadedFileType;
  confidence: number;
};

function scoreByKeywords(haystack: string, keywords: string[]): number {
  return keywords.reduce((sum, kw) => sum + (haystack.includes(kw) ? 1 : 0), 0);
}

export function classifyParsedFiles(parsedFiles: ParsedFile[]): ClassifiedFile[] {
  return parsedFiles.map((file) => {
    const text = [
      file.originalName.toLowerCase(),
      file.sheetNames.join(" ").toLowerCase(),
      file.columns.join(" ").toLowerCase(),
      JSON.stringify(file.rows.slice(0, 3)).toLowerCase(),
    ].join(" ");

    const candidates: Array<{ type: UploadedFileType; score: number }> = [
      { type: "LOADS", score: scoreByKeywords(text, ["load", "origin", "destination", "rate", "mile"]) },
      { type: "FUEL", score: scoreByKeywords(text, ["fuel", "gallon", "station", "price", "diesel"]) },
      { type: "MAINTENANCE", score: scoreByKeywords(text, ["repair", "maintenance", "service", "parts"]) },
      { type: "DRIVERS", score: scoreByKeywords(text, ["driver", "license", "phone", "name"]) },
      { type: "TRUCKS", score: scoreByKeywords(text, ["truck", "unit", "vin", "tractor"]) },
      { type: "SETTLEMENTS", score: scoreByKeywords(text, ["settlement", "pay", "invoice"]) },
    ];

    const best = candidates.sort((a, b) => b.score - a.score)[0];
    if (!best || best.score <= 1) {
      return { ...file, fileType: "UNKNOWN", confidence: 0.2 };
    }

    return {
      ...file,
      fileType: best.type,
      confidence: Math.min(0.99, best.score / 6),
    };
  });
}

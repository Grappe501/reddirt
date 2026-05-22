import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseCsv } from "../imports/csv-column-detector";
import type { GoodChangeRow } from "./types";

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

export async function parseGoodChangeCsvFile(filePath: string): Promise<GoodChangeRow[]> {
  const text = await readFile(filePath, "utf8");
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]);
  const rows: GoodChangeRow[] = [];
  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    const row = {} as GoodChangeRow;
    headers.forEach((header, index) => {
      (row as Record<string, string>)[header] = values[index] ?? "";
    });
    if (row.transfer_id) rows.push(row);
  }
  return rows;
}

export async function parseGoodChangeCsvViaDetector(filePath: string): Promise<GoodChangeRow[]> {
  const text = await readFile(filePath, "utf8");
  const parsed = parseCsv(text);
  return parsed.rows
    .filter((row) => row.transfer_id)
    .map((row) => row as unknown as GoodChangeRow);
}

export function goodChangeCsvPath(sourceDir: string): string {
  return path.join(sourceDir, "_Committee to Elect Kelly Grappe_transactions_Apr 1, 2026_Apr 30, 2026_.csv");
}

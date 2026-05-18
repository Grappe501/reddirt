import { readFile } from "node:fs/promises";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { ApprovalEvidence, ApprovalField, ApprovalItemSource } from "./approval-types";

const APRIL26_DIR = path.resolve(process.cwd(), "..", "Compliance", "April26");

export function getApril26Dir(): string {
  return process.env.COMPLIANCE_APRIL26_DIR?.trim() || APRIL26_DIR;
}

export type April26GoodChangeRow = Record<string, string>;

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

export async function loadApril26GoodChangeRows(): Promise<April26GoodChangeRow[]> {
  const dir = getApril26Dir();
  const csvName = "_Committee to Elect Kelly Grappe_transactions_Apr 1, 2026_Apr 30, 2026_.csv";
  const csvPath = path.join(dir, csvName);
  const text = await readFile(csvPath, "utf8");
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]);
  const rows: April26GoodChangeRow[] = [];
  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    const row: April26GoodChangeRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    if (row.transfer_id) rows.push(row);
  }
  return rows;
}

export async function listApril26ImageFiles(): Promise<Array<{ relativePath: string; absolutePath: string; kind: "check" | "receipt" | "in_kind" }>> {
  const dir = getApril26Dir();
  const results: Array<{ relativePath: string; absolutePath: string; kind: "check" | "receipt" | "in_kind" }> = [];
  async function walk(relative: string) {
    let entries;
    try {
      entries = await readdir(path.join(dir, relative), { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const rel = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(rel);
      else if (/\.(jpe?g|heic|png)$/i.test(entry.name)) {
        const lower = rel.toLowerCase();
        const kind = lower.includes("check") ? "check" : lower.startsWith("att.") ? "in_kind" : "receipt";
        results.push({ relativePath: rel.replace(/\\/g, "/"), absolutePath: path.join(dir, rel), kind });
      }
    }
  }
  await walk("");
  return results;
}

export function goodChangeRowToApprovalFields(row: April26GoodChangeRow): ApprovalField[] {
  const fields: Array<{ key: string; label: string; value: string; required: boolean; source: "goodchange" | "imported" }> = [
    { key: "donorFirstName", label: "First name", value: row.first_name ?? "", required: true, source: "goodchange" },
    { key: "donorLastName", label: "Last name", value: row.last_name ?? "", required: true, source: "goodchange" },
    { key: "amount", label: "Amount", value: row.amount ?? "", required: true, source: "goodchange" },
    { key: "net", label: "Net deposit", value: row.net ?? "", required: true, source: "goodchange" },
    { key: "employer", label: "Employer", value: row.employer_name ?? "", required: true, source: "goodchange" },
    { key: "occupation", label: "Occupation", value: row.employer_occupation ?? "", required: true, source: "goodchange" },
    { key: "city", label: "City", value: row.billing_city ?? "", required: false, source: "goodchange" },
    { key: "state", label: "State", value: row.billing_state ?? "", required: false, source: "goodchange" },
    { key: "payout", label: "Payout batch", value: row.payout ?? "", required: false, source: "goodchange" },
  ];
  return fields.map((field) => ({
    ...field,
    fieldType: field.key === "amount" || field.key === "net" ? "money" : "text",
    editable: true,
    confidence: field.value ? "high" : "low",
    validationStatus: field.required && !field.value.trim() ? "missing" : "ok",
  }));
}

export function goodChangeRowEvidence(row: April26GoodChangeRow): ApprovalEvidence[] {
  return [
    {
      id: `gc-row-${row.transfer_id}`,
      type: "goodchange_row",
      title: "GoodChange export row",
      textPreview: JSON.stringify(row, null, 2).slice(0, 2000),
      confidence: "high",
    },
    {
      id: `gc-source-${row.transfer_id}`,
      type: "source_file",
      title: "April 2026 GoodChange CSV",
      summary: "H:\\SOSWebsite\\Compliance\\April26",
      confidence: "high",
    },
  ];
}

export function imageEvidence(relativePath: string, kind: "check" | "receipt" | "in_kind"): ApprovalEvidence[] {
  const type = kind === "check" ? "check_image" : kind === "in_kind" ? "source_file" : "receipt_image";
  return [
    {
      id: `img-${relativePath}`,
      type,
      title: path.basename(relativePath),
      path: relativePath,
      summary: `April26 folder — ${kind}`,
      confidence: "medium",
    },
  ];
}

export async function april26FolderExists(): Promise<boolean> {
  try {
    const info = await stat(getApril26Dir());
    return info.isDirectory();
  } catch {
    return false;
  }
}

export function mapImageSource(kind: "check" | "receipt" | "in_kind"): ApprovalItemSource {
  if (kind === "check") return "check_contribution";
  if (kind === "in_kind") return "in_kind_contribution";
  return "receipt_expense";
}

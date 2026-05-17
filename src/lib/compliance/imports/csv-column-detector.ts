import type { ColumnTypeInference, CsvParseResult } from "./types";

export function parseCsv(input: string): CsvParseResult {
  const warnings: string[] = [];
  const rows = parseCsvRows(input.replace(/^\uFEFF/, ""));
  if (rows.length === 0) {
    return { columns: [], rows: [], warnings: ["CSV was empty."] };
  }

  const columns = rows[0].map((column, index) => column.trim() || `column_${index + 1}`);
  const seen = new Map<string, number>();
  const normalizedColumns = columns.map((column) => {
    const count = seen.get(column) ?? 0;
    seen.set(column, count + 1);
    return count === 0 ? column : `${column}_${count + 1}`;
  });

  const dataRows = rows.slice(1).filter((row) => row.some((value) => value.trim().length > 0));
  const records = dataRows.map((row) => {
    const record: Record<string, string> = {};
    normalizedColumns.forEach((column, index) => {
      record[column] = row[index]?.trim() ?? "";
    });
    return record;
  });

  if (normalizedColumns.length !== columns.length) {
    warnings.push("Duplicate headers were renamed with numeric suffixes.");
  }

  return { columns: normalizedColumns, rows: records, warnings };
}

export function inferColumnTypes(columns: string[], rows: Array<Record<string, string>>): ColumnTypeInference[] {
  return columns.map((column) => {
    const values = rows.map((row) => row[column] ?? "").filter((value) => value.trim().length > 0);
    const sampleValues = Array.from(new Set(values)).slice(0, 5);
    return {
      column,
      inferredType: inferType(values),
      nonEmptyCount: values.length,
      sampleValues,
    };
  });
}

export function sanitizeSampleRows(rows: Array<Record<string, string>>, limit = 10): Array<Record<string, string>> {
  return rows.slice(0, limit).map((row) => {
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      sanitized[key] = sanitizeValue(key, value);
    }
    return sanitized;
  });
}

export function normalizeColumnName(column: string): string {
  return column
    .toLowerCase()
    .replace(/[_/-]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseMoney(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const negative = /^\(.*\)$/.test(trimmed) || trimmed.startsWith("-");
  const cleaned = trimmed.replace(/[^0-9.]/g, "");
  if (!cleaned) return undefined;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return undefined;
  return negative ? -parsed : parsed;
}

export function parseBooleanish(value: string | undefined): boolean | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (["true", "yes", "y", "1", "recurring", "refund"].includes(normalized)) return true;
  if (["false", "no", "n", "0"].includes(normalized)) return false;
  return undefined;
}

export function stableHash(value: unknown): string {
  const input = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function parseCsvRows(input: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  row.push(current);
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

function inferType(values: string[]): ColumnTypeInference["inferredType"] {
  if (values.length === 0) return "empty";
  const sample = values.slice(0, 20);
  const count = (predicate: (value: string) => boolean) => sample.filter(predicate).length;
  const threshold = Math.max(1, Math.ceil(sample.length * 0.7));
  if (count((value) => parseMoney(value) !== undefined) >= threshold) return "money";
  if (count((value) => !Number.isNaN(Date.parse(value))) >= threshold) return "date";
  if (count((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) >= threshold) return "email";
  if (count((value) => value.replace(/\D/g, "").length >= 7) >= threshold) return "phone";
  if (count((value) => parseBooleanish(value) !== undefined) >= threshold) return "boolean";
  return "text";
}

function sanitizeValue(column: string, value: string): string {
  const normalized = normalizeColumnName(column);
  if (!value) return "";
  if (normalized.includes("email")) return redactEmail(value);
  if (normalized.includes("phone")) return value.replace(/\d(?=\d{2})/g, "x");
  if (normalized.includes("name") || normalized.includes("donor")) return redactName(value);
  if (normalized.includes("address") || normalized.includes("street")) return "[address redacted]";
  if (normalized.includes("transaction") || normalized.includes("id")) return redactIdentifier(value);
  return value;
}

function redactEmail(value: string): string {
  const [local, domain] = value.split("@");
  if (!domain) return "[email redacted]";
  return `${local.slice(0, 1) || "x"}***@${domain}`;
}

function redactName(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1)}***`)
    .join(" ");
}

function redactIdentifier(value: string): string {
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

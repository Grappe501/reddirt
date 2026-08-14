import { createHash } from "node:crypto";
import path from "node:path";
import * as XLSX from "xlsx";

export type ContactIntelParsedTable = {
  headers: string[];
  rows: Record<string, string>[];
  truncated: boolean;
};

export class ContactIntelUploadError extends Error {
  constructor(
    public readonly code: "file" | "size" | "ext" | "headers" | "rows" | "parse" | "dupheaders",
    message: string,
  ) {
    super(message);
    this.name = "ContactIntelUploadError";
  }
}

const MAX_ROWS = 20_000;
export const CONTACT_INTEL_MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const CONTACT_INTEL_MAX_ROWS = MAX_ROWS;
export const CONTACT_INTEL_ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"] as const;

function sha256Hex(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

export function hashContactIntelBuffer(buf: Buffer): string {
  return sha256Hex(buf);
}

export function hashContactIntelRow(raw: Record<string, string>): string {
  return sha256Hex(JSON.stringify(raw));
}

export function sanitizeContactIntelFilename(filename: string): string {
  const base = path.basename(filename.replace(/\\/g, "/")).trim() || "upload.csv";
  return base.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 200);
}

export function contactIntelExtension(filename: string): string {
  const base = path.basename(filename.replace(/\\/g, "/")).toLowerCase();
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(dot) : "";
}

export function assertContactIntelUpload(filename: string, byteLength: number): void {
  if (!filename || byteLength <= 0) {
    throw new ContactIntelUploadError("file", "Choose a CSV or XLSX file.");
  }
  if (byteLength > CONTACT_INTEL_MAX_UPLOAD_BYTES) {
    throw new ContactIntelUploadError("size", "File is larger than 8MB.");
  }
  const ext = contactIntelExtension(filename);
  if (!CONTACT_INTEL_ALLOWED_EXTENSIONS.includes(ext as (typeof CONTACT_INTEL_ALLOWED_EXTENSIONS)[number])) {
    throw new ContactIntelUploadError("ext", "Only .csv, .xlsx, and .xls files are accepted.");
  }
}

function uniquifyHeaders(headers: string[]): { headers: string[]; hadDuplicates: boolean } {
  const seen = new Map<string, number>();
  let hadDuplicates = false;
  const out = headers.map((raw) => {
    const h = raw.trim();
    if (!h) return "";
    const n = (seen.get(h) ?? 0) + 1;
    seen.set(h, n);
    if (n === 1) return h;
    hadDuplicates = true;
    return `${h}__${n}`;
  });
  return { headers: out, hadDuplicates };
}

function tableFromMatrix(matrix: (string | number | boolean | null)[][]): ContactIntelParsedTable {
  if (matrix.length === 0) return { headers: [], rows: [], truncated: false };
  const { headers, hadDuplicates } = uniquifyHeaders((matrix[0] ?? []).map((h) => String(h ?? "").trim()));
  if (hadDuplicates) {
    throw new ContactIntelUploadError("dupheaders", "Duplicate column headers are not allowed. Rename them and retry.");
  }
  if (headers.filter(Boolean).length === 0) {
    throw new ContactIntelUploadError("headers", "No header row found.");
  }
  const rows: Record<string, string>[] = [];
  let truncated = false;
  for (let i = 1; i < matrix.length; i++) {
    const cells = matrix[i] ?? [];
    const row: Record<string, string> = {};
    let any = false;
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!key) continue;
      const value = String(cells[c] ?? "").trim();
      row[key] = value;
      if (value) any = true;
    }
    if (!any) continue;
    if (rows.length >= MAX_ROWS) {
      truncated = true;
      break;
    }
    rows.push(row);
  }
  if (truncated) {
    throw new ContactIntelUploadError("rows", "File has more than 20,000 data rows. Split it and retry.");
  }
  return { headers: headers.filter(Boolean), rows, truncated: false };
}

export function parseContactIntelCsv(text: string): ContactIntelParsedTable {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length === 0 || (lines.length === 1 && !lines[0]?.trim())) {
    return { headers: [], rows: [], truncated: false };
  }
  const matrix = lines.map((line) => parseCsvLine(line));
  return tableFromMatrix(matrix);
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

const XLSX_ZIP_MAGIC = Buffer.from([0x50, 0x4b]); // PK
const XLS_OLE_MAGIC = Buffer.from([0xd0, 0xcf, 0x11, 0xe0]);

function looksLikeSpreadsheetBinary(buf: Buffer): boolean {
  if (buf.length < 4) return false;
  if (buf.subarray(0, 2).equals(XLSX_ZIP_MAGIC)) return true;
  if (buf.subarray(0, 4).equals(XLS_OLE_MAGIC)) return true;
  return false;
}

export function parseContactIntelXlsx(buf: Buffer): ContactIntelParsedTable {
  if (!looksLikeSpreadsheetBinary(buf)) {
    throw new ContactIntelUploadError("parse", "Could not read that spreadsheet.");
  }
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buf, { type: "buffer", raw: false, dense: false, cellFormula: false });
  } catch {
    throw new ContactIntelUploadError("parse", "Could not read that spreadsheet.");
  }
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return { headers: [], rows: [], truncated: false };
  const sheet = wb.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false,
  });
  return tableFromMatrix(matrix);
}

export function parseContactIntelUpload(filename: string, buf: Buffer): ContactIntelParsedTable {
  assertContactIntelUpload(filename, buf.byteLength);
  const ext = contactIntelExtension(filename);
  try {
    if (ext === ".xlsx" || ext === ".xls") {
      return parseContactIntelXlsx(buf);
    }
    return parseContactIntelCsv(buf.toString("utf8"));
  } catch (err) {
    if (err instanceof ContactIntelUploadError) throw err;
    throw new ContactIntelUploadError("parse", "Could not read headers or rows from that file.");
  }
}

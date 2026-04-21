/**
 * # SOS-style voter file (first-pass) format
 *
 * **Supported:** UTF-8 text with a header row. Delimiter is **auto-detected** on the
 * header line: if there are more tab characters than commas, use TAB; else if the line
 * contains `|`, use pipe; else comma.
 *
 * **Default column names** (case-insensitive header match, trimmed):
 * - `VOTER_ID` — canonical `voterFileKey` in our warehouse (opaque SOS/vendor key)
 * - `COUNTY_FIPS` — 5-digit county FIPS (Arkansas uses `05xxx`; extra digits are stripped / padded)
 * - `REGISTRATION_DATE` — `YYYY-MM-DD` or `M/D/YYYY` or `MM/DD/YYYY`
 * - `CITY` (optional) — `VoterRecord.city`
 * - `PRECINCT` (optional) — `VoterRecord.precinct`
 *
 * **Override** with environment variables (column header labels in the file):
 * - `VOTER_FILE_COL_VOTER_ID` (default `VOTER_ID`)
 * - `VOTER_FILE_COL_COUNTY_FIPS` (default `COUNTY_FIPS`)
 * - `VOTER_FILE_COL_REGISTRATION_DATE` (default `REGISTRATION_DATE`)
 * - `VOTER_FILE_COL_CITY` (default `CITY` — omit or empty to ignore)
 * - `VOTER_FILE_COL_PRECINCT` (default `PRECINCT` — omit or empty to ignore)
 *
 * **Duplicate keys:** If the file lists the same `VOTER_ID` more than once, the **last**
 * occurrence wins. A note is attached to the snapshot (`operatorNotes` append) when
 * duplicates are merged.
 *
 * This is a deliberate **first** implementation; a future pass can add fixed-width, vendor
 * layouts, or a staging table for multi-million-row files.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

export type SosVoterFileColumnNames = {
  voterId: string;
  countyFips: string;
  registrationDate: string;
  city: string | null;
  precinct: string | null;
  /** Optional PII for volunteer intake / match — map file headers via env. */
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
};

function envCol(name: string, fallback: string): string {
  return (process.env[name] ?? fallback).trim() || fallback;
}

export function getSosVoterFileColumnNames(): SosVoterFileColumnNames {
  const city = envCol("VOTER_FILE_COL_CITY", "CITY");
  const prec = envCol("VOTER_FILE_COL_PRECINCT", "PRECINCT");
  const fn = envCol("VOTER_FILE_COL_FIRST_NAME", "FIRST_NAME");
  const ln = envCol("VOTER_FILE_COL_LAST_NAME", "LAST_NAME");
  const ph = envCol("VOTER_FILE_COL_PHONE", "PHONE");
  return {
    voterId: envCol("VOTER_FILE_COL_VOTER_ID", "VOTER_ID"),
    countyFips: envCol("VOTER_FILE_COL_COUNTY_FIPS", "COUNTY_FIPS"),
    registrationDate: envCol("VOTER_FILE_COL_REGISTRATION_DATE", "REGISTRATION_DATE"),
    city: city.length ? city : null,
    precinct: prec.length ? prec : null,
    firstName: fn.length ? fn : null,
    lastName: ln.length ? ln : null,
    phone: ph.length ? ph : null,
  };
}

export type ParsedSosVoterRow = {
  lineNumber: number;
  voterFileKey: string;
  countyFipsRaw: string;
  registrationDate: Date | null;
  city: string | null;
  precinct: string | null;
  firstName: string | null;
  lastName: string | null;
  phone10: string | null;
};

function toPhone10Digits(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) return d.slice(1) || null;
  if (d.length === 10) return d;
  return null;
}

export function sha256FileBytes(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

export async function readFileBytesWithMeta(filePath: string): Promise<{
  buffer: Buffer;
  sourceFileHash: string;
  sourceFilename: string;
}> {
  const buffer = await readFile(filePath);
  return { buffer, sourceFileHash: sha256FileBytes(buffer), sourceFilename: basename(filePath) };
}

/**
 * Keep last 5 digits, left-pad with zeros if 3–4 digit county portion only.
 */
export function normalizeCountyFips(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 3) return null;
  if (digits.length >= 5) {
    return digits.slice(-5);
  }
  return digits.padStart(5, "0");
}

function parseSosDate(raw: string): Date | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) {
    const d = new Date(`${t.slice(0, 10)}T12:00:00.000Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const month = Number(m[1]) - 1;
    const day = Number(m[2]);
    let y = Number(m[3]);
    if (y < 100) y += 2000;
    const d = new Date(Date.UTC(y, month, day, 12, 0, 0, 0));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** Single-line CSV/TSV with RFC4180-style quoted fields (no embedded newlines). */
export function parseDelimitedLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let i = 0;
  let inQuotes = false;
  while (i < line.length) {
    const c = line[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cur += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === delimiter) {
      out.push(cur);
      cur = "";
      i += 1;
      continue;
    }
    cur += c;
    i += 1;
  }
  out.push(cur);
  return out;
}

function detectDelimiter(headerLine: string): string {
  const tabs = (headerLine.match(/\t/g) ?? []).length;
  const commas = (headerLine.match(/,/g) ?? []).length;
  if (tabs > commas) return "\t";
  if (headerLine.includes("|")) return "|";
  return ",";
}

function headerIndexMap(headerLine: string, delimiter: string): { delimiter: string; index: Map<string, number> } {
  const cells = parseDelimitedLine(headerLine, delimiter);
  const index = new Map<string, number>();
  for (let i = 0; i < cells.length; i += 1) {
    const key = cells[i]!.replace(/^\uFEFF/, "").trim().toLowerCase();
    if (!index.has(key)) index.set(key, i);
  }
  return { delimiter, index };
}

function getCell(
  line: string,
  delimiter: string,
  index: Map<string, number>,
  colName: string
): string {
  const cells = parseDelimitedLine(line, delimiter);
  const i = index.get(colName.trim().toLowerCase());
  if (i == null) return "";
  return (cells[i] ?? "").trim().replace(/^"(.*)"$/, "$1");
}

export type ParseSosVoterFileResult = {
  delimiter: string;
  rowCount: number;
  /** Last row wins for duplicate `voterFileKey` */
  byKey: Map<string, ParsedSosVoterRow>;
  duplicateKeyCount: number;
  /** Lines skipped: missing id / bad row */
  badLines: { line: number; reason: string }[];
  headerNames: string[];
};

export function parseSosVoterFileContent(text: string, col = getSosVoterFileColumnNames()): ParseSosVoterFileResult {
  const lines = text.split(/\r?\n/);
  const nonEmpty = lines
    .map((l, i) => ({ l: l.trim(), lineNumber: i + 1 }))
    .filter((x) => x.l.length > 0);
  if (nonEmpty.length < 1) {
    return {
      delimiter: ",",
      rowCount: 0,
      byKey: new Map(),
      duplicateKeyCount: 0,
      badLines: [{ line: 0, reason: "Empty file" }],
      headerNames: [],
    };
  }
  const headerLine = nonEmpty[0]!.l;
  const { delimiter, index } = headerIndexMap(headerLine, detectDelimiter(headerLine));
  const headerCells = parseDelimitedLine(headerLine, delimiter);

  const vHead = col.voterId.trim().toLowerCase();
  const fHead = col.countyFips.trim().toLowerCase();
  const rHead = col.registrationDate.trim().toLowerCase();
  if (!index.has(vHead) || !index.has(fHead) || !index.has(rHead)) {
    return {
      delimiter,
      rowCount: 0,
      byKey: new Map(),
      duplicateKeyCount: 0,
      badLines: [
        {
          line: 1,
          reason: `Missing required column(s). Need headers matching ${col.voterId}, ${col.countyFips}, ${col.registrationDate} (case-insensitive).`,
        },
      ],
      headerNames: headerCells.map((h) => h.replace(/^\uFEFF/, "").trim()),
    };
  }

  const cityKey = col.city ? col.city.trim().toLowerCase() : null;
  const precKey = col.precinct ? col.precinct.trim().toLowerCase() : null;
  const fnKey = col.firstName ? col.firstName.trim().toLowerCase() : null;
  const lnKey = col.lastName ? col.lastName.trim().toLowerCase() : null;
  const phKey = col.phone ? col.phone.trim().toLowerCase() : null;
  const byKey = new Map<string, ParsedSosVoterRow>();
  const badLines: { line: number; reason: string }[] = [];
  let duplicateKeyCount = 0;

  for (let n = 1; n < nonEmpty.length; n += 1) {
    const { l, lineNumber } = nonEmpty[n]!;
    const id = getCell(l, delimiter, index, vHead);
    if (!id) {
      badLines.push({ line: lineNumber, reason: "Missing voter id" });
      continue;
    }
    const fipsRaw = getCell(l, delimiter, index, fHead);
    const reg = getCell(l, delimiter, index, rHead);
    const city = cityKey ? getCell(l, delimiter, index, cityKey) || null : null;
    const precinct = precKey ? getCell(l, delimiter, index, precKey) || null : null;
    const firstName = fnKey && index.has(fnKey) ? getCell(l, delimiter, index, fnKey) || null : null;
    const lastName = lnKey && index.has(lnKey) ? getCell(l, delimiter, index, lnKey) || null : null;
    const phoneRaw = phKey && index.has(phKey) ? getCell(l, delimiter, index, phKey) || null : null;

    if (byKey.has(id)) duplicateKeyCount += 1;
    byKey.set(id, {
      lineNumber,
      voterFileKey: id,
      countyFipsRaw: fipsRaw,
      registrationDate: parseSosDate(reg),
      city: city && city.length > 0 ? city : null,
      precinct: precinct && precinct.length > 0 ? precinct : null,
      firstName: firstName && firstName.length > 0 ? firstName : null,
      lastName: lastName && lastName.length > 0 ? lastName : null,
      phone10: toPhone10Digits(phoneRaw),
    });
  }

  return {
    delimiter,
    rowCount: byKey.size,
    byKey,
    duplicateKeyCount,
    badLines,
    headerNames: headerCells.map((h) => h.replace(/^\uFEFF/, "").trim()),
  };
}

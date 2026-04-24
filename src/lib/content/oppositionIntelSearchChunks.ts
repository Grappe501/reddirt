import fs from "node:fs";
import path from "node:path";
import type { DocChunk } from "./parse";

const MAX = 12_000;

function cap(text: string): string {
  const t = text.trim();
  if (t.length <= MAX) return t;
  return `${t.slice(0, MAX)}…`;
}

function pathSlug(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 200) || "row";
}

/** Matches `shortlistLocalKey` in `ingest-arkleg-legislator-opposition.ts` for stable SearchChunk paths. */
function gridRowLocalKey(session: string, billNumber: string, role: string): string {
  const roleSlug = role.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 48);
  return `ARKLEG|${session}|${billNumber}|${roleSlug}`;
}

type AllBillsDryRunFile = {
  bills?: Array<{
    billNumber?: string;
    title?: string;
    session?: string;
    role?: string;
    officialBillUrl?: string;
  }>;
  entityName?: string;
  member?: string;
};

type CandidateBundle = {
  entities?: Array<{ localKey?: string; name?: string; currentOffice?: string | null; metadataJson?: unknown }>;
  billRecords?: Array<{
    billNumber?: string | null;
    title?: string | null;
    role?: string | null;
    session?: string | null;
    policyArea?: string | null;
    impactArea?: string | null;
    sourceUrl?: string | null;
    notes?: string | null;
    reviewStatus?: string | null;
    confidence?: string | null;
    metadataJson?: unknown;
  }>;
};

/**
 * One SearchChunk per bill row in `opponent-legislative-candidates.json` (INTEL-4B-3 bridge).
 * Content is labeled unverified; retrieval is for internal research hygiene, not public claims.
 */
export function loadOppositionLegislativeCandidateChunks(repoRoot: string): DocChunk[] {
  const abs = path.join(repoRoot, "data/intelligence/opponent-legislative-candidates.json");
  if (!fs.existsSync(abs)) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(abs, "utf8")) as unknown;
  } catch {
    return [];
  }

  const bundle = parsed as CandidateBundle;
  const bills = bundle.billRecords ?? [];
  if (!bills.length) return [];

  const entityName =
    bundle.entities?.find((e) => e.localKey === "intel_seed_arkleg_legislator")?.name ??
    bundle.entities?.[0]?.name ??
    "Subject (see entity in JSON)";

  const out: DocChunk[] = [];
  for (let i = 0; i < bills.length; i++) {
    const row = bills[i];
    const meta =
      row.metadataJson !== undefined &&
      row.metadataJson !== null &&
      typeof row.metadataJson === "object" &&
      !Array.isArray(row.metadataJson)
        ? (row.metadataJson as Record<string, unknown>)
        : {};
    const shortlistKey = typeof meta.shortlistLocalKey === "string" ? meta.shortlistLocalKey : null;
    const stableId = shortlistKey ?? `${row.billNumber ?? "bill"}_${row.session ?? "session"}_${i}`;
    const p = `intel:opposition:legislative-candidate:${pathSlug(stableId)}`;

    const lines = [
      "INTERNAL — Opposition intelligence (legislative candidate row). NOT verified.",
      `Subject context: ${entityName}`,
      `Bill: ${row.billNumber ?? "—"}`,
      `Session: ${row.session ?? "—"}`,
      `Role (from arkleg grid — confirm on official bill page): ${row.role ?? "—"}`,
      `Title (from arkleg grid — confirm on official bill page): ${row.title ?? "—"}`,
      row.policyArea ? `Policy area (heuristic): ${row.policyArea}` : "",
      row.impactArea ? `Impact hint (heuristic): ${row.impactArea}` : "",
      row.sourceUrl ? `Official bill URL: ${row.sourceUrl}` : "",
      `Review status: ${row.reviewStatus ?? "—"}`,
      `Confidence: ${row.confidence ?? "—"}`,
      row.notes ? `Notes: ${row.notes}` : "",
      "Do not treat as fact until a human verifies sponsor, title, and text on the official legislature site.",
    ];

    const content = cap(lines.filter(Boolean).join("\n"));
    if (content.length < 40) continue;

    out.push({
      path: p,
      title: `${row.billNumber ?? "Bill"} — candidate legislative record (unverified)`,
      chunkIndex: 0,
      content,
    });
  }

  return out;
}

/**
 * Full legislator bill-grid rows from `arkleg-hammer-all-bills.dryrun.json` (written by
 * `npm run ingest:arkleg-opposition -- --dry-run --write-summary`). Use before candidate chunks
 * in ingest order so the 25 shortlist rows can overwrite with richer metadata (same path keys).
 */
export function loadArklegAllGridBillSearchChunks(repoRoot: string): DocChunk[] {
  const abs = path.join(repoRoot, "data/intelligence/generated/arkleg-hammer-all-bills.dryrun.json");
  if (!fs.existsSync(abs)) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(abs, "utf8")) as unknown;
  } catch {
    return [];
  }

  const file = parsed as AllBillsDryRunFile;
  const bills = file.bills ?? [];
  if (!bills.length) return [];

  const subject = file.entityName?.trim() || "Kim Hammer";

  const out: DocChunk[] = [];
  for (let i = 0; i < bills.length; i++) {
    const row = bills[i];
    const session = row.session ?? "";
    const billNumber = row.billNumber ?? "";
    const role = row.role ?? "";
    const stable = gridRowLocalKey(session, billNumber, role);
    const p = `intel:opposition:legislative-candidate:${pathSlug(stable)}`;

    const lines = [
      "INTERNAL — Arkansas legislature bill-grid row (arkleg dry-run export). NOT verified.",
      `Legislator context: ${subject}`,
      `Bill: ${billNumber || "—"}`,
      `Session: ${session || "—"}`,
      `Role (grid section — confirm on official bill page): ${role || "—"}`,
      `Title (grid only — confirm on official bill page): ${row.title ?? "—"}`,
      row.officialBillUrl ? `Official bill URL: ${row.officialBillUrl}` : "",
      "Use for research indexing only; do not cite as fact without human verification of the official bill page.",
    ];

    const content = cap(lines.filter(Boolean).join("\n"));
    if (content.length < 40) continue;

    out.push({
      path: p,
      title: `${billNumber || "Bill"} — arkleg grid row (unverified)`,
      chunkIndex: 0,
      content,
    });
  }

  return out;
}

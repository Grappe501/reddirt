/**
 * Canonical, deterministic **campaign file base names** for `OwnedMediaAsset.fileName` / storage stems.
 * Original camera or ingest names stay in `originalFileName`; this module produces a stable, human-readable
 * `CampaignOS/{county|subject|use|version}` style key for search and handoff.
 *
 * Ingest (Supabase `storageKey` paths) may stay unique-by-hash; the filename/title in DB can follow these rules
 * when staff apply “Rename to campaign standard” in Media Center.
 */

import { createHash } from "node:crypto";

export type CampaignFilenameParts = {
  /** Date anchor (capture, event, or ingest). */
  date: Date;
  /** Lowercase county slug, e.g. `pottawatomie-ok` */
  countySlug?: string | null;
  /** Short event slug, e.g. `town-hall-2026-04` */
  eventSlug?: string | null;
  /** Subject or scene token, e.g. `b-roll-stage` */
  subject?: string | null;
  /** Use / role token, e.g. `press-web`, `social-clip-30` */
  use?: string | null;
  /** Monotonic when regenerating a derivative of the same logical asset. */
  version?: number;
  /** Drives stem hash suffix when you need a guaranteed-unique id without re-reading the DB. */
  uniquenessKey?: string;
};

const MAX_SEG = 48;

/**
 * One path segment: lowercase, ascii-ish, no spaces.
 */
export function slugifySegment(raw: string | null | undefined, fallback = "x"): string {
  if (!raw || !String(raw).trim()) return fallback;
  const s = String(raw)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SEG);
  return s || fallback;
}

function yyyymmdd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/**
 * Build the **stem** (no extension) of a campaign filename, e.g. `20260429__pott-ok_town-hall_speech-v2`.
 * Deterministic for the same `CampaignFilenameParts` (unless `uniquenessKey` differs).
 */
export function buildCampaignFileStem(parts: CampaignFilenameParts): string {
  const { date, countySlug, eventSlug, subject, use, version = 1, uniquenessKey } = parts;
  const a = yyyymmdd(date);
  const c = countySlug ? slugifySegment(countySlug, "c") : "nocounty";
  const e = eventSlug ? slugifySegment(eventSlug, "ev") : "noevent";
  const s = subject ? slugifySegment(subject, "sub") : "nosubject";
  const u = use ? slugifySegment(use, "use") : "original";
  const v = `v${Math.max(1, Math.floor(version))}`;
  const base = [a, c, e, s, u, v].join("__");
  if (uniquenessKey) {
    const h = createHash("sha256").update(uniquenessKey).digest("hex").slice(0, 6);
    return `${base}__${h}`;
  }
  return base;
}

/**
 * Full filename with extension, e.g. `20260429__c__e__s__u__v1__abc123.jpg`.
 */
export function buildCampaignFileName(
  parts: CampaignFilenameParts & { ext: string }
): { stem: string; fileName: string } {
  const ext = String(parts.ext)
    .trim()
    .toLowerCase()
    .replace(/^\./, "");
  const stem = buildCampaignFileStem(parts);
  return { stem, fileName: `${stem}.${ext || "bin"}` };
}

/**
 * Fingerprint for duplicate / lineage notes (stored in `importDuplicateNote` or batch `metadataJson`).
 */
export function fingerprintIngestKey(parts: { contentSha256?: string; storageKey?: string; originalFileName?: string }): string {
  const p = [parts.contentSha256, parts.storageKey, parts.originalFileName].filter(Boolean).join("|");
  return createHash("sha256").update(p).digest("hex").slice(0, 12);
}

/** Normalized extension with leading dot for `buildCampaignFileName`, default bin. */
export function extFromFileName(name: string): string {
  const s = String(name).trim();
  if (!s) return "bin";
  const i = s.lastIndexOf(".");
  if (i < 0 || i === s.length - 1) return "bin";
  if (i === 0) return "bin";
  return s.slice(i + 1).toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
}

/**
 * Deterministic name for a newly ingested **original** (or indexed copy) — DB-only; not a user OS path.
 * `uniquenessKey` should be stable for the row (e.g. asset id or content hash) so re-runs do not thrash.
 */
export function buildIngestOriginalCanonicalName(params: {
  originalBaseName: string;
  anchorDate: Date;
  ext: string;
  /** e.g. `local-index` vs `upload` */
  ingestMode: "local-index" | "upload";
  countySlug?: string | null;
  eventSlug?: string | null;
  subjectHint?: string | null;
  uniquenessKey: string;
}): { fileName: string; stem: string } {
  const sub =
    params.subjectHint?.trim() ||
    slugifySegment(
      String(params.originalBaseName).replace(/\.[^.]+$/i, "") || "media",
      "media"
    );
  return buildCampaignFileName({
    date: params.anchorDate,
    countySlug: params.countySlug,
    eventSlug: params.eventSlug,
    subject: sub,
    use: params.ingestMode,
    version: 1,
    uniquenessKey: params.uniquenessKey,
    ext: extFromFileName(params.ext.startsWith(".") ? params.ext : `.${params.ext}`),
  });
}

/**
 * **Derivative** canonical filename (sibling/child `OwnedMediaAsset` rows) — `derivativeType` token becomes part of `use` unless overridden.
 */
export function buildDerivativeCanonicalFileName(params: {
  parentStemHint: string;
  derivativeTypeToken: string;
  anchorDate: Date;
  ext: string;
  version?: number;
  countySlug?: string | null;
  eventSlug?: string | null;
  uniquenessKey?: string;
}): { fileName: string; stem: string } {
  const use = `derive-${slugifySegment(params.derivativeTypeToken, "der")}`;
  return buildCampaignFileName({
    date: params.anchorDate,
    countySlug: params.countySlug,
    eventSlug: params.eventSlug,
    subject: slugifySegment(params.parentStemHint, "src"),
    use,
    version: params.version ?? 1,
    uniquenessKey: params.uniquenessKey,
    ext: extFromFileName(params.ext.startsWith(".") ? params.ext : `.${params.ext}`),
  });
}

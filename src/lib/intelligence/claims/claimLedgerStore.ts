import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  CitationAnchor,
  CitationAnchorsFile,
  CitationSource,
  CitationSourcesFile,
  ClaimLedgerAuditEvent,
  ClaimLedgerAuditLogFile,
  ClaimLedgerEntry,
  ClaimLedgerFile,
} from "./claimLedgerTypes";

export const CLAIM_LEDGER_REL = "data/intelligence/claims/claim-ledger.json";
export const CITATION_SOURCES_REL = "data/intelligence/claims/citation-sources.json";
export const CITATION_ANCHORS_REL = "data/intelligence/claims/citation-anchors.json";
export const CLAIM_LEDGER_AUDIT_LOG_REL = "data/intelligence/claims/claim-ledger-audit-log.json";

function absPath(repoRoot: string, rel: string): string {
  return path.join(repoRoot, rel);
}

function readJson<T>(repoRoot: string, rel: string, fallback: T): T {
  const abs = absPath(repoRoot, rel);
  if (!existsSync(abs)) return fallback;
  return JSON.parse(readFileSync(abs, "utf8")) as T;
}

function writeJson(repoRoot: string, rel: string, data: unknown): void {
  const abs = absPath(repoRoot, rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function loadClaimLedger(repoRoot: string = process.cwd()): ClaimLedgerFile {
  return readJson<ClaimLedgerFile>(repoRoot, CLAIM_LEDGER_REL, {
    version: 1,
    generatedAt: new Date().toISOString(),
    purpose: "Campaign intelligence claim ledger — INTERNAL ONLY",
    entries: [],
  });
}

export function saveClaimLedger(file: ClaimLedgerFile, repoRoot: string = process.cwd()): void {
  file.generatedAt = new Date().toISOString();
  writeJson(repoRoot, CLAIM_LEDGER_REL, file);
}

export function loadCitationSources(repoRoot: string = process.cwd()): CitationSourcesFile {
  return readJson<CitationSourcesFile>(repoRoot, CITATION_SOURCES_REL, {
    version: 1,
    generatedAt: new Date().toISOString(),
    sources: [],
  });
}

export function saveCitationSources(file: CitationSourcesFile, repoRoot: string = process.cwd()): void {
  file.generatedAt = new Date().toISOString();
  writeJson(repoRoot, CITATION_SOURCES_REL, file);
}

export function loadCitationAnchors(repoRoot: string = process.cwd()): CitationAnchorsFile {
  return readJson<CitationAnchorsFile>(repoRoot, CITATION_ANCHORS_REL, {
    version: 1,
    generatedAt: new Date().toISOString(),
    anchors: [],
  });
}

export function saveCitationAnchors(file: CitationAnchorsFile, repoRoot: string = process.cwd()): void {
  file.generatedAt = new Date().toISOString();
  writeJson(repoRoot, CITATION_ANCHORS_REL, file);
}

export function loadClaimLedgerAuditLog(repoRoot: string = process.cwd()): ClaimLedgerAuditLogFile {
  return readJson<ClaimLedgerAuditLogFile>(repoRoot, CLAIM_LEDGER_AUDIT_LOG_REL, {
    version: 1,
    generatedAt: new Date().toISOString(),
    events: [],
  });
}

export function appendClaimLedgerAuditEvent(
  event: Omit<ClaimLedgerAuditEvent, "eventId" | "timestamp">,
  repoRoot: string = process.cwd(),
): void {
  const log = loadClaimLedgerAuditLog(repoRoot);
  log.events.push({
    ...event,
    eventId: `cla-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
  });
  log.generatedAt = new Date().toISOString();
  writeJson(repoRoot, CLAIM_LEDGER_AUDIT_LOG_REL, log);
}

export function findClaimById(id: string, repoRoot?: string): ClaimLedgerEntry | null {
  const ledger = loadClaimLedger(repoRoot);
  return ledger.entries.find((e) => e.id === id) ?? null;
}

export function findClaimsByBriefId(briefId: string, repoRoot?: string): ClaimLedgerEntry[] {
  return loadClaimLedger(repoRoot).entries.filter((e) => e.sourceBriefIds.includes(briefId));
}

export function findClaimsByEvidencePacketId(packetId: string, repoRoot?: string): ClaimLedgerEntry[] {
  return loadClaimLedger(repoRoot).entries.filter((e) => e.sourceEvidencePacketIds.includes(packetId));
}

export function findClaimsByCounty(countySlug: string, repoRoot?: string): ClaimLedgerEntry[] {
  return loadClaimLedger(repoRoot).entries.filter((e) => e.countySlug === countySlug);
}

export function findClaimsByOpponent(opponentId: string, repoRoot?: string): ClaimLedgerEntry[] {
  return loadClaimLedger(repoRoot).entries.filter((e) => e.opponentId === opponentId);
}

export function findClaimsByStatus(
  status: ClaimLedgerEntry["verificationStatus"],
  repoRoot?: string,
): ClaimLedgerEntry[] {
  return loadClaimLedger(repoRoot).entries.filter((e) => e.verificationStatus === status);
}

export function findClaimsNeedingReview(repoRoot?: string): ClaimLedgerEntry[] {
  return loadClaimLedger(repoRoot).entries.filter(
    (e) =>
      e.verificationStatus === "DRAFT" ||
      e.verificationStatus === "NEEDS_REVIEW" ||
      e.classification === "NEEDS_REVIEW" ||
      e.classification === "UNSUPPORTED",
  );
}

export function appendClaimLedgerEntry(entry: ClaimLedgerEntry, repoRoot: string = process.cwd()): void {
  const ledger = loadClaimLedger(repoRoot);
  ledger.entries.push(entry);
  saveClaimLedger(ledger, repoRoot);
}

export function upsertClaimLedgerEntry(entry: ClaimLedgerEntry, repoRoot: string = process.cwd()): void {
  const ledger = loadClaimLedger(repoRoot);
  const idx = ledger.entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) ledger.entries[idx] = entry;
  else ledger.entries.push(entry);
  saveClaimLedger(ledger, repoRoot);
}

/** Batch upsert — single read/write for many entries (use in ingest passes). */
export function upsertClaimLedgerEntriesBatch(
  entries: ClaimLedgerEntry[],
  repoRoot: string = process.cwd(),
): void {
  if (entries.length === 0) return;
  const ledger = loadClaimLedger(repoRoot);
  const byId = new Map(ledger.entries.map((e) => [e.id, e]));
  for (const entry of entries) byId.set(entry.id, entry);
  ledger.entries = [...byId.values()];
  saveClaimLedger(ledger, repoRoot);
}

export function appendCitationSource(source: CitationSource, repoRoot: string = process.cwd()): void {
  const file = loadCitationSources(repoRoot);
  if (!file.sources.some((s) => s.id === source.id)) {
    file.sources.push(source);
    saveCitationSources(file, repoRoot);
  }
}

export function appendCitationAnchor(anchor: CitationAnchor, repoRoot: string = process.cwd()): void {
  const file = loadCitationAnchors(repoRoot);
  if (!file.anchors.some((a) => a.id === anchor.id)) {
    file.anchors.push(anchor);
    saveCitationAnchors(file, repoRoot);
  }
}

export function linkClaimToCitationAnchor(
  claimId: string,
  anchorId: string,
  repoRoot: string = process.cwd(),
): boolean {
  const claim = findClaimById(claimId, repoRoot);
  if (!claim) return false;
  if (!claim.citationAnchorIds.includes(anchorId)) {
    claim.citationAnchorIds.push(anchorId);
    claim.updatedAt = new Date().toISOString();
    upsertClaimLedgerEntry(claim, repoRoot);
  }
  return true;
}

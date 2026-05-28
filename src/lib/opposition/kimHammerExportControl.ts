import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { buildKimHammerDebateExportPayload } from "@/app/api/opposition/kim-hammer/debate-export/route";
import {
  citationsForClaim,
  loadKimHammerCitationLocker,
  narrativeHealthSignals,
} from "@/lib/opposition/kimHammerCitationLocker";
import { canExportClaim, loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import type {
  KimHammerExportHistoryEntry,
  KimHammerExportHistoryFile,
  KimHammerExportLineage,
} from "@/lib/opposition/types/kimHammerExportControl";

export const KIM_HAMMER_EXPORT_HISTORY_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-export-history.json";

function absPath(repoRoot: string, relPath: string): string {
  return path.join(repoRoot, relPath);
}

function readJsonFile<T>(repoRoot: string, relPath: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, relPath), "utf8")) as T;
}

export function loadKimHammerExportHistory(
  repoRoot: string = process.cwd(),
): KimHammerExportHistoryFile {
  if (!existsSync(absPath(repoRoot, KIM_HAMMER_EXPORT_HISTORY_REL))) {
    return {
      generatedAt: new Date().toISOString(),
      historyVersion: "1.0",
      purpose: "Export history not yet initialized.",
      entries: [],
    };
  }
  return readJsonFile<KimHammerExportHistoryFile>(repoRoot, KIM_HAMMER_EXPORT_HISTORY_REL);
}

export function computeExportContentChecksum(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

export function resolveCitationIdsForClaims(
  claimIds: string[],
  repoRoot?: string,
): string[] {
  const ids = new Set<string>();
  for (const claimId of claimIds) {
    for (const card of citationsForClaim(claimId, repoRoot)) {
      ids.add(card.id);
    }
  }
  return [...ids];
}

export function resolveNarrativeIdsForCitations(
  citationIds: string[],
  repoRoot?: string,
): string[] {
  const locker = loadKimHammerCitationLocker(repoRoot);
  const ids = new Set<string>();
  for (const card of locker.citations) {
    if (!citationIds.includes(card.id)) continue;
    for (const narrativeId of card.linkedNarrativeIds ?? []) {
      ids.add(narrativeId);
    }
  }
  return [...ids];
}

export function buildKimHammerExportLineage(
  claimIds: string[],
  repoRoot?: string,
  exportId?: string,
  packetVersion?: string,
): KimHammerExportLineage {
  const citationIds = resolveCitationIdsForClaims(claimIds, repoRoot);
  const narrativeIds = resolveNarrativeIdsForCitations(citationIds, repoRoot);
  const locker = loadKimHammerCitationLocker(repoRoot);

  const citations = locker.citations
    .filter((card) => citationIds.includes(card.id))
    .map((card) => ({
      citationId: card.id,
      sourceUrl: card.sourceUrl,
      summary: card.summary,
      sourceHealth: card.sourceHealth,
      reviewStatus: card.reviewStatus,
      linkedClaimIds: card.linkedClaimIds,
    }));

  const narrativeHealthSignalsList = narrativeIds.map((narrativeId) => {
    const signal = narrativeHealthSignals(narrativeId, repoRoot);
    return { narrativeId, signal: signal.signal };
  });

  return {
    exportId,
    packetVersion: packetVersion ?? nextKimHammerPacketVersion(repoRoot),
    claimIds,
    citations,
    narrativeIds,
    narrativeHealthSignals: narrativeHealthSignalsList,
  };
}

export function nextKimHammerPacketVersion(repoRoot?: string): string {
  const history = loadKimHammerExportHistory(repoRoot);
  const count = history.entries.length;
  const major = 1;
  const minor = Math.floor(count / 10);
  const patch = count % 10;
  return `${major}.${minor}.${patch}`;
}

export type KimHammerExportControlSummary = import("@/lib/opposition/types/kimHammerExportControl").KimHammerExportControlSummary;

export function summarizeKimHammerExportControl(repoRoot?: string): KimHammerExportControlSummary {
  const history = loadKimHammerExportHistory(repoRoot);
  const index = loadKimHammerEvidenceIndex(repoRoot ?? process.cwd());

  const scopedExports: Record<string, number> = {};
  const formatCounts: Record<string, number> = {};

  for (const entry of history.entries) {
    scopedExports[entry.scope] = (scopedExports[entry.scope] ?? 0) + 1;
    formatCounts[entry.format] = (formatCounts[entry.format] ?? 0) + 1;
  }

  const sorted = [...history.entries].sort((a, b) => b.exportedAt.localeCompare(a.exportedAt));
  const latest = sorted[0];

  return {
    generatedAt: history.generatedAt,
    totalExports: history.entries.length,
    latestExportAt: latest?.exportedAt ?? null,
    latestPacketVersion: latest?.packetVersion ?? null,
    exportReadyClaimCount: index.claims.filter(canExportClaim).length,
    scopedExports,
    formatCounts,
  };
}

export function getCurrentExportReadyLineage(repoRoot?: string): KimHammerExportLineage {
  const payload = buildKimHammerDebateExportPayload();
  const claimIds = payload.claims.map((claim) => claim.id);
  return buildKimHammerExportLineage(claimIds, repoRoot, undefined, nextKimHammerPacketVersion(repoRoot));
}

export function filterExportHistoryEntries(
  history: KimHammerExportHistoryFile,
  filters: {
    scopeQuery?: string;
    claimQuery?: string;
    operatorQuery?: string;
  },
): KimHammerExportHistoryEntry[] {
  const scopeQuery = filters.scopeQuery?.trim().toLowerCase() ?? "";
  const claimQuery = filters.claimQuery?.trim().toLowerCase() ?? "";
  const operatorQuery = filters.operatorQuery?.trim().toLowerCase() ?? "";

  return [...history.entries]
    .sort((a, b) => b.exportedAt.localeCompare(a.exportedAt))
    .filter((entry) => {
      if (scopeQuery && !entry.scope.toLowerCase().includes(scopeQuery)) return false;
      if (operatorQuery && !entry.operator.toLowerCase().includes(operatorQuery)) return false;
      if (claimQuery) {
        const haystack = [...entry.claimIds, ...entry.citationIds, entry.exportId]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(claimQuery)) return false;
      }
      return true;
    });
}

export function exportHistoryForClaim(
  claimId: string,
  repoRoot?: string,
): KimHammerExportHistoryEntry[] {
  return loadKimHammerExportHistory(repoRoot).entries.filter((entry) =>
    entry.claimIds.includes(claimId),
  );
}

export function exportHistoryForCitation(
  citationId: string,
  repoRoot?: string,
): KimHammerExportHistoryEntry[] {
  return loadKimHammerExportHistory(repoRoot).entries.filter((entry) =>
    entry.citationIds.includes(citationId),
  );
}

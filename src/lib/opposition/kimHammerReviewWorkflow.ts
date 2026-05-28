import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type {
  KimHammerClaimGraphFile,
} from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import type { KimHammerPublicDebateEvidenceBoardFile } from "@/lib/opposition/types/kimHammerEvidence";
import { getReviewStatusLabel } from "@/lib/opposition/kimHammerPublicationSafety";
import type { KimHammerReviewStatus } from "@/lib/opposition/types/kimHammerEvidence";
import { KIM_HAMMER_REVIEW_STATUSES } from "@/lib/opposition/types/kimHammerEvidence";

export const KIM_HAMMER_DEBATE_BOARD_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-public-debate-evidence-board.json";

export const KIM_HAMMER_CLAIM_GRAPH_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-kh4-claim-graph.json";

export const KIM_HAMMER_REVIEW_AUDIT_LOG_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-claim-review-audit-log.json";

export const KIM_HAMMER_REVIEW_BACKUP_DIR_REL =
  "data/opposition/kim-hammer-profile/backups";

export type KimHammerClaimReviewSource = "PUBLIC_DEBATE_BOARD" | "CLAIM_GRAPH";

export type KimHammerClaimReviewAuditEntry = {
  auditId: string;
  claimId: string;
  sourceFile: string;
  previousStatus: KimHammerReviewStatus | "LEGACY_UNSET";
  nextStatus: KimHammerReviewStatus;
  reviewer: string;
  reviewNotes: string;
  changedAt: string;
  changedByRoute: string;
  backupPath: string;
};

export type KimHammerClaimReviewAuditLog = {
  logVersion: string;
  updatedAt: string;
  entries: KimHammerClaimReviewAuditEntry[];
};

export type KimHammerClaimReviewUpdateInput = {
  claimId: string;
  nextStatus: KimHammerReviewStatus;
  reviewer: string;
  reviewNotes?: string;
  changedByRoute: string;
};

export type KimHammerClaimReviewUpdateResult =
  | {
      ok: true;
      auditId: string;
      claimId: string;
      sourceFile: string;
      previousStatus: KimHammerReviewStatus | "LEGACY_UNSET";
      nextStatus: KimHammerReviewStatus;
      backupPath: string;
      exportReadyClaims: number;
    }
  | { ok: false; error: string };

function absPath(repoRoot: string, relPath: string): string {
  return path.join(repoRoot, relPath);
}

function toPosixRel(repoRoot: string, filePath: string): string {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function readJsonFile<T>(repoRoot: string, relPath: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, relPath), "utf8")) as T;
}

function writeJsonFile(repoRoot: string, relPath: string, data: unknown): void {
  const target = absPath(repoRoot, relPath);
  const dir = path.dirname(target);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function backupJsonBeforeMutation(
  sourceRelPath: string,
  repoRoot: string = process.cwd(),
): string {
  const sourceAbs = absPath(repoRoot, sourceRelPath);
  if (!existsSync(sourceAbs)) {
    throw new Error(`Source file not found for backup: ${sourceRelPath}`);
  }

  const backupDirAbs = absPath(repoRoot, KIM_HAMMER_REVIEW_BACKUP_DIR_REL);
  if (!existsSync(backupDirAbs)) {
    mkdirSync(backupDirAbs, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = path.basename(sourceRelPath, ".json");
  const backupAbs = path.join(backupDirAbs, `${baseName}-${timestamp}.json`);
  copyFileSync(sourceAbs, backupAbs);
  return toPosixRel(repoRoot, backupAbs);
}

export function loadKimHammerClaimReviewAuditLog(
  repoRoot: string = process.cwd(),
): KimHammerClaimReviewAuditLog {
  const rel = KIM_HAMMER_REVIEW_AUDIT_LOG_REL;
  if (!existsSync(absPath(repoRoot, rel))) {
    return { logVersion: "1.0", updatedAt: new Date().toISOString(), entries: [] };
  }
  return readJsonFile<KimHammerClaimReviewAuditLog>(repoRoot, rel);
}

function appendKimHammerClaimReviewAuditEntry(
  entry: KimHammerClaimReviewAuditEntry,
  repoRoot: string,
): void {
  const log = loadKimHammerClaimReviewAuditLog(repoRoot);
  log.updatedAt = entry.changedAt;
  log.entries = [...log.entries, entry].slice(-500);
  writeJsonFile(repoRoot, KIM_HAMMER_REVIEW_AUDIT_LOG_REL, log);
}

export function resolveKimHammerClaimReviewSource(
  claimId: string,
  repoRoot: string = process.cwd(),
): { sourceFile: string; indexSource: KimHammerClaimReviewSource } | null {
  const debateBoard = readJsonFile<KimHammerPublicDebateEvidenceBoardFile>(
    repoRoot,
    KIM_HAMMER_DEBATE_BOARD_REL,
  );
  if (debateBoard.items.some((item) => item.id === claimId)) {
    return { sourceFile: KIM_HAMMER_DEBATE_BOARD_REL, indexSource: "PUBLIC_DEBATE_BOARD" };
  }

  const claimGraph = readJsonFile<KimHammerClaimGraphFile>(repoRoot, KIM_HAMMER_CLAIM_GRAPH_REL);
  if (claimGraph.claims.some((claim) => claim.id === claimId)) {
    return { sourceFile: KIM_HAMMER_CLAIM_GRAPH_REL, indexSource: "CLAIM_GRAPH" };
  }

  return null;
}

export function getAllowedReviewTransitions(
  currentStatus: KimHammerReviewStatus | undefined,
): KimHammerReviewStatus[] {
  const normalized = currentStatus ?? "NEEDS_REVIEW";
  return KIM_HAMMER_REVIEW_STATUSES.filter((status) => status !== normalized);
}

function validateReviewUpdateInput(input: KimHammerClaimReviewUpdateInput): string | null {
  const claimId = input.claimId?.trim();
  if (!claimId) {
    return "claimId is required.";
  }

  const reviewer = input.reviewer?.trim();
  if (!reviewer) {
    return "reviewer is required.";
  }

  if (!KIM_HAMMER_REVIEW_STATUSES.includes(input.nextStatus)) {
    return `Invalid review status: ${input.nextStatus}`;
  }

  if (!input.changedByRoute?.trim()) {
    return "changedByRoute is required.";
  }

  return null;
}

function buildAuditId(claimId: string, changedAt: string): string {
  const slug = claimId.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 80);
  const stamp = changedAt.replace(/[:.]/g, "-");
  return `audit-${slug}-${stamp}`;
}

function mutateDebateBoardClaim(
  board: KimHammerPublicDebateEvidenceBoardFile,
  claimId: string,
  nextStatus: KimHammerReviewStatus,
  reviewer: string,
  reviewNotes: string,
  changedAt: string,
): KimHammerReviewStatus | "LEGACY_UNSET" {
  const item = board.items.find((row) => row.id === claimId);
  if (!item) {
    throw new Error(`Debate-board claim not found: ${claimId}`);
  }

  const previousStatus = item.reviewStatus
    ? item.reviewStatus
    : ("LEGACY_UNSET" as const);

  item.reviewStatus = nextStatus;
  item.reviewer = reviewer;
  item.reviewNotes = reviewNotes;
  item.reviewedAt = changedAt;
  if (nextStatus === "EXPORTED") {
    item.lastExportedAt = changedAt;
  }

  board.generatedAt = changedAt;
  return previousStatus;
}

function mutateClaimGraphClaim(
  graph: KimHammerClaimGraphFile,
  claimId: string,
  nextStatus: KimHammerReviewStatus,
  reviewer: string,
  reviewNotes: string,
  changedAt: string,
): KimHammerReviewStatus | "LEGACY_UNSET" {
  const claim = graph.claims.find((row) => row.id === claimId);
  if (!claim) {
    throw new Error(`Claim-graph claim not found: ${claimId}`);
  }

  const previousStatus = claim.reviewStatus
    ? claim.reviewStatus
    : ("LEGACY_UNSET" as const);

  claim.reviewStatus = nextStatus;
  claim.reviewer = reviewer;
  claim.reviewNotes = reviewNotes;
  claim.reviewedAt = changedAt;
  if (nextStatus === "EXPORTED") {
    claim.lastExportedAt = changedAt;
  }

  graph.generatedAt = changedAt;
  return previousStatus;
}

export function updateKimHammerClaimReviewStatus(
  input: KimHammerClaimReviewUpdateInput,
  repoRoot: string = process.cwd(),
): KimHammerClaimReviewUpdateResult {
  const validationError = validateReviewUpdateInput(input);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const claimId = input.claimId.trim();
  const reviewer = input.reviewer.trim();
  const reviewNotes = input.reviewNotes?.trim() ?? "";
  const changedAt = new Date().toISOString();

  const location = resolveKimHammerClaimReviewSource(claimId, repoRoot);
  if (!location) {
    return { ok: false, error: `Governed claim not found: ${claimId}` };
  }

  const currentClaimStatus =
    location.indexSource === "PUBLIC_DEBATE_BOARD"
      ? readJsonFile<KimHammerPublicDebateEvidenceBoardFile>(repoRoot, KIM_HAMMER_DEBATE_BOARD_REL)
          .items.find((row) => row.id === claimId)?.reviewStatus
      : readJsonFile<KimHammerClaimGraphFile>(repoRoot, KIM_HAMMER_CLAIM_GRAPH_REL).claims.find(
          (row) => row.id === claimId,
        )?.reviewStatus;

  if (currentClaimStatus === input.nextStatus) {
    return { ok: false, error: "Review status unchanged." };
  }

  let previousStatus: KimHammerReviewStatus | "LEGACY_UNSET";

  try {
    const backupPath = backupJsonBeforeMutation(location.sourceFile, repoRoot);

    if (location.indexSource === "PUBLIC_DEBATE_BOARD") {
      const board = readJsonFile<KimHammerPublicDebateEvidenceBoardFile>(
        repoRoot,
        KIM_HAMMER_DEBATE_BOARD_REL,
      );
      previousStatus = mutateDebateBoardClaim(
        board,
        claimId,
        input.nextStatus,
        reviewer,
        reviewNotes,
        changedAt,
      );
      writeJsonFile(repoRoot, KIM_HAMMER_DEBATE_BOARD_REL, board);
    } else {
      const graph = readJsonFile<KimHammerClaimGraphFile>(repoRoot, KIM_HAMMER_CLAIM_GRAPH_REL);
      previousStatus = mutateClaimGraphClaim(
        graph,
        claimId,
        input.nextStatus,
        reviewer,
        reviewNotes,
        changedAt,
      );
      writeJsonFile(repoRoot, KIM_HAMMER_CLAIM_GRAPH_REL, graph);
    }

    const auditId = buildAuditId(claimId, changedAt);
    appendKimHammerClaimReviewAuditEntry(
      {
        auditId,
        claimId,
        sourceFile: location.sourceFile,
        previousStatus,
        nextStatus: input.nextStatus,
        reviewer,
        reviewNotes,
        changedAt,
        changedByRoute: input.changedByRoute,
        backupPath,
      },
      repoRoot,
    );

    const index = loadKimHammerEvidenceIndex(repoRoot);

    return {
      ok: true,
      auditId,
      claimId,
      sourceFile: location.sourceFile,
      previousStatus,
      nextStatus: input.nextStatus,
      backupPath,
      exportReadyClaims: index.metrics.exportReadyClaims,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Review update failed.";
    return { ok: false, error: message };
  }
}

export function getKimHammerReviewStatusLabelForClaim(
  claimId: string,
  repoRoot: string = process.cwd(),
): KimHammerReviewStatus | "LEGACY_UNSET" {
  const index = loadKimHammerEvidenceIndex();
  const claim = index.claims.find((row) => row.id === claimId);
  if (!claim) {
    return "LEGACY_UNSET";
  }
  return getReviewStatusLabel(claim) as KimHammerReviewStatus | "LEGACY_UNSET";
}

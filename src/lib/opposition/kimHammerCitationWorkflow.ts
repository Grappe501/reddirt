import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  computeCitationSourceHealth,
  KIM_HAMMER_CITATION_LOCKER_REL,
} from "@/lib/opposition/kimHammerCitationLocker";
import type {
  KimHammerCitationCard,
  KimHammerCitationLockerFile,
  KimHammerCitationReviewStatus,
} from "@/lib/opposition/types/kimHammerCitationLocker";
import type {
  KimHammerEvidencePolarity,
  KimHammerEvidenceStatus,
  KimHammerSourceClass,
  KimHammerSourceConfidence,
  KimHammerSourceDurability,
} from "@/lib/opposition/types/kimHammerEvidence";
import { KIM_HAMMER_CITATION_REVIEW_STATUSES } from "@/lib/opposition/types/kimHammerCitationLocker";

export const KIM_HAMMER_CITATION_AUDIT_LOG_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-citation-audit-log.json";

export const KIM_HAMMER_CITATION_BACKUP_DIR_REL =
  "data/opposition/kim-hammer-profile/backups";

export type KimHammerCitationAuditAction =
  | "CREATE"
  | "UPDATE"
  | "LINK_CLAIM"
  | "REVALIDATE";

export type KimHammerCitationAuditEntry = {
  auditId: string;
  citationId: string;
  action: KimHammerCitationAuditAction;
  previousReviewStatus: KimHammerCitationReviewStatus;
  nextReviewStatus: KimHammerCitationReviewStatus;
  operator: string;
  notes: string;
  changedAt: string;
  changedByRoute: string;
  backupPath: string;
  linkedClaimId?: string;
  sourceFile: string;
};

export type KimHammerCitationAuditLog = {
  logVersion: string;
  updatedAt: string;
  entries: KimHammerCitationAuditEntry[];
};

export type KimHammerCitationUpdateInput = {
  citationId: string;
  operator: string;
  changedByRoute: string;
  reviewStatus?: KimHammerCitationReviewStatus;
  operatorNotes?: string;
  revalidate?: boolean;
};

export type KimHammerCitationCreateInput = {
  operator: string;
  changedByRoute: string;
  sourceUrl: string;
  summary: string;
  sourceClass?: KimHammerSourceClass;
  sourceDurability?: KimHammerSourceDurability;
  evidenceStatus?: KimHammerEvidenceStatus;
  sourceConfidence?: KimHammerSourceConfidence;
  originTaskId?: string;
  linkedNarrativeIds?: string[];
  context?: string;
};

export type KimHammerCitationLinkInput = {
  citationId: string;
  claimId: string;
  polarity?: KimHammerEvidencePolarity;
  operator: string;
  changedByRoute: string;
};

export type KimHammerCitationMutationResult =
  | {
      ok: true;
      auditId: string;
      citationId: string;
      action: KimHammerCitationAuditAction;
      backupPath: string;
      citationCount: number;
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

export function backupCitationJsonBeforeMutation(
  sourceRelPath: string,
  repoRoot: string = process.cwd(),
): string {
  const sourceAbs = absPath(repoRoot, sourceRelPath);
  if (!existsSync(sourceAbs)) {
    throw new Error(`Source file not found for backup: ${sourceRelPath}`);
  }

  const backupDirAbs = absPath(repoRoot, KIM_HAMMER_CITATION_BACKUP_DIR_REL);
  if (!existsSync(backupDirAbs)) {
    mkdirSync(backupDirAbs, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = path.basename(sourceRelPath, ".json");
  const backupAbs = path.join(backupDirAbs, `${baseName}-${timestamp}.json`);
  copyFileSync(sourceAbs, backupAbs);
  return toPosixRel(repoRoot, backupAbs);
}

export function loadKimHammerCitationAuditLog(
  repoRoot: string = process.cwd(),
): KimHammerCitationAuditLog {
  if (!existsSync(absPath(repoRoot, KIM_HAMMER_CITATION_AUDIT_LOG_REL))) {
    return { logVersion: "1.0", updatedAt: new Date().toISOString(), entries: [] };
  }
  return readJsonFile<KimHammerCitationAuditLog>(repoRoot, KIM_HAMMER_CITATION_AUDIT_LOG_REL);
}

function appendKimHammerCitationAuditEntry(
  entry: KimHammerCitationAuditEntry,
  repoRoot: string,
): void {
  const log = loadKimHammerCitationAuditLog(repoRoot);
  log.updatedAt = entry.changedAt;
  log.entries = [...log.entries, entry].slice(-500);
  writeJsonFile(repoRoot, KIM_HAMMER_CITATION_AUDIT_LOG_REL, log);
}

function buildAuditId(citationId: string, changedAt: string): string {
  const slug = citationId.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 80);
  const stamp = changedAt.replace(/[:.]/g, "-");
  return `cite-audit-${slug}-${stamp}`;
}

function buildCitationId(sourceUrl: string, changedAt: string): string {
  const host = sourceUrl.replace(/^https?:\/\//, "").split("/")[0] ?? "source";
  const slug = host.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 24);
  const stamp = changedAt.slice(0, 10);
  return `cite-${slug}-${stamp}`;
}

function buildSourceId(sourceUrl: string): string {
  const host = sourceUrl.replace(/^https?:\/\//, "").split("/")[0] ?? "source";
  return `src-${host.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 32)}`;
}

function inferSourceClass(sourceUrl: string): KimHammerSourceClass {
  if (sourceUrl.includes("arkleg.state.ar.us")) return "LEGISLATIVE_RECORD";
  if (sourceUrl.includes("senate.arkansas.gov") || sourceUrl.includes("arkansas.gov")) {
    return "OFFICIAL_PROFILE";
  }
  if (sourceUrl.startsWith("internal:")) return "INTERNAL_ARTIFACT";
  if (sourceUrl.includes("pbs.org") || sourceUrl.includes("youtube")) return "VIDEO_AUDIO";
  return "OTHER";
}

function refreshCardHealth(card: KimHammerCitationCard): KimHammerCitationCard {
  return {
    ...card,
    sourceHealth: computeCitationSourceHealth(card),
  };
}

export function updateKimHammerCitationCard(
  input: KimHammerCitationUpdateInput,
  repoRoot: string = process.cwd(),
): KimHammerCitationMutationResult {
  if (!input.citationId?.trim()) return { ok: false, error: "citationId is required." };
  if (!input.operator?.trim()) return { ok: false, error: "operator is required." };
  if (!input.changedByRoute?.trim()) return { ok: false, error: "changedByRoute is required." };

  if (input.reviewStatus && !KIM_HAMMER_CITATION_REVIEW_STATUSES.includes(input.reviewStatus)) {
    return { ok: false, error: `Invalid review status: ${input.reviewStatus}` };
  }

  const locker = readJsonFile<KimHammerCitationLockerFile>(
    repoRoot,
    KIM_HAMMER_CITATION_LOCKER_REL,
  );
  const card = locker.citations.find((row) => row.id === input.citationId.trim());
  if (!card) {
    return { ok: false, error: `Citation not found: ${input.citationId}` };
  }

  const previousReviewStatus = card.reviewStatus;
  const changedAt = new Date().toISOString();
  let hasChanges = false;

  if (input.reviewStatus && input.reviewStatus !== card.reviewStatus) {
    card.reviewStatus = input.reviewStatus;
    hasChanges = true;
  }

  if (input.operatorNotes !== undefined && input.operatorNotes.trim() !== (card.operatorNotes ?? "")) {
    card.operatorNotes = input.operatorNotes.trim();
    hasChanges = true;
  }

  if (input.revalidate) {
    card.lastValidatedAt = changedAt;
    hasChanges = true;
  }

  if (!hasChanges) {
    return { ok: false, error: "Citation fields unchanged." };
  }

  card.lastUpdated = changedAt;
  card.sourceHealth = computeCitationSourceHealth(card);

  try {
    const backupPath = backupCitationJsonBeforeMutation(KIM_HAMMER_CITATION_LOCKER_REL, repoRoot);
    locker.generatedAt = changedAt;
    writeJsonFile(repoRoot, KIM_HAMMER_CITATION_LOCKER_REL, locker);

    const auditId = buildAuditId(card.id, changedAt);
    const action: KimHammerCitationAuditAction = input.revalidate ? "REVALIDATE" : "UPDATE";

    appendKimHammerCitationAuditEntry(
      {
        auditId,
        citationId: card.id,
        action,
        previousReviewStatus,
        nextReviewStatus: card.reviewStatus,
        operator: input.operator.trim(),
        notes: card.operatorNotes ?? "",
        changedAt,
        changedByRoute: input.changedByRoute,
        backupPath,
        sourceFile: KIM_HAMMER_CITATION_LOCKER_REL,
      },
      repoRoot,
    );

    return {
      ok: true,
      auditId,
      citationId: card.id,
      action,
      backupPath,
      citationCount: locker.citations.length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Citation update failed.";
    return { ok: false, error: message };
  }
}

export function createKimHammerCitationCard(
  input: KimHammerCitationCreateInput,
  repoRoot: string = process.cwd(),
): KimHammerCitationMutationResult {
  if (!input.operator?.trim()) return { ok: false, error: "operator is required." };
  if (!input.changedByRoute?.trim()) return { ok: false, error: "changedByRoute is required." };
  if (!input.sourceUrl?.trim()) return { ok: false, error: "sourceUrl is required." };
  if (!input.summary?.trim()) return { ok: false, error: "summary is required." };

  const locker = readJsonFile<KimHammerCitationLockerFile>(
    repoRoot,
    KIM_HAMMER_CITATION_LOCKER_REL,
  );

  const changedAt = new Date().toISOString();
  const sourceUrl = input.sourceUrl.trim();
  const existing = locker.citations.find((row) => row.sourceUrl === sourceUrl);
  if (existing) {
    return { ok: false, error: `Citation already exists for URL: ${existing.id}` };
  }

  const sourceId = buildSourceId(sourceUrl);
  if (!locker.sources.some((source) => source.id === sourceId)) {
    locker.sources.push({
      id: sourceId,
      url: sourceUrl,
      sourceClass: input.sourceClass ?? inferSourceClass(sourceUrl),
      sourceDurability: input.sourceDurability ?? "MEDIUM",
      archiveCaptured: false,
      sourceConfidence: input.sourceConfidence ?? "MEDIUM",
    });
  }

  const citationId = buildCitationId(sourceUrl, changedAt);
  const newCard: KimHammerCitationCard = refreshCardHealth({
    id: citationId,
    sourceId,
    sourceUrl,
    summary: input.summary.trim(),
    context: input.context?.trim(),
    sourceClass: input.sourceClass ?? inferSourceClass(sourceUrl),
    sourceDurability: input.sourceDurability ?? "MEDIUM",
    archiveCaptured: false,
    crossVerified: false,
    reviewStatus: "DRAFT",
    sourceHealth: "NEEDS_REVALIDATION",
    evidenceStatus: input.evidenceStatus ?? "NEEDS_REVIEW",
    sourceConfidence: input.sourceConfidence ?? "MEDIUM",
    originTaskId: input.originTaskId?.trim(),
    linkedClaimIds: [],
    linkedNarrativeIds: input.linkedNarrativeIds,
    capturedAt: changedAt,
    lastUpdated: changedAt,
  });

  try {
    const backupPath = backupCitationJsonBeforeMutation(KIM_HAMMER_CITATION_LOCKER_REL, repoRoot);
    locker.citations.push(newCard);
    locker.generatedAt = changedAt;
    writeJsonFile(repoRoot, KIM_HAMMER_CITATION_LOCKER_REL, locker);

    const auditId = buildAuditId(citationId, changedAt);
    appendKimHammerCitationAuditEntry(
      {
        auditId,
        citationId,
        action: "CREATE",
        previousReviewStatus: "DRAFT",
        nextReviewStatus: "DRAFT",
        operator: input.operator.trim(),
        notes: input.summary.trim(),
        changedAt,
        changedByRoute: input.changedByRoute,
        backupPath,
        sourceFile: KIM_HAMMER_CITATION_LOCKER_REL,
      },
      repoRoot,
    );

    return {
      ok: true,
      auditId,
      citationId,
      action: "CREATE",
      backupPath,
      citationCount: locker.citations.length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Citation create failed.";
    return { ok: false, error: message };
  }
}

export function linkKimHammerCitationToClaim(
  input: KimHammerCitationLinkInput,
  repoRoot: string = process.cwd(),
): KimHammerCitationMutationResult {
  if (!input.citationId?.trim()) return { ok: false, error: "citationId is required." };
  if (!input.claimId?.trim()) return { ok: false, error: "claimId is required." };
  if (!input.operator?.trim()) return { ok: false, error: "operator is required." };
  if (!input.changedByRoute?.trim()) return { ok: false, error: "changedByRoute is required." };

  const locker = readJsonFile<KimHammerCitationLockerFile>(
    repoRoot,
    KIM_HAMMER_CITATION_LOCKER_REL,
  );
  const card = locker.citations.find((row) => row.id === input.citationId.trim());
  if (!card) {
    return { ok: false, error: `Citation not found: ${input.citationId}` };
  }

  const claimId = input.claimId.trim();
  const polarity = input.polarity ?? "SUPPORTING";
  const alreadyLinked = locker.claimLinks.some(
    (link) => link.citationId === card.id && link.claimId === claimId,
  );
  if (alreadyLinked) {
    return { ok: false, error: "Citation already linked to this claim." };
  }

  const changedAt = new Date().toISOString();
  const previousReviewStatus = card.reviewStatus;

  try {
    const backupPath = backupCitationJsonBeforeMutation(KIM_HAMMER_CITATION_LOCKER_REL, repoRoot);

    locker.claimLinks.push({ claimId, citationId: card.id, polarity });
    if (!card.linkedClaimIds.includes(claimId)) {
      card.linkedClaimIds.push(claimId);
    }
    card.lastUpdated = changedAt;
    locker.generatedAt = changedAt;
    writeJsonFile(repoRoot, KIM_HAMMER_CITATION_LOCKER_REL, locker);

    const auditId = buildAuditId(card.id, changedAt);
    appendKimHammerCitationAuditEntry(
      {
        auditId,
        citationId: card.id,
        action: "LINK_CLAIM",
        previousReviewStatus,
        nextReviewStatus: card.reviewStatus,
        operator: input.operator.trim(),
        notes: `Linked to claim ${claimId} (${polarity})`,
        changedAt,
        changedByRoute: input.changedByRoute,
        backupPath,
        linkedClaimId: claimId,
        sourceFile: KIM_HAMMER_CITATION_LOCKER_REL,
      },
      repoRoot,
    );

    return {
      ok: true,
      auditId,
      citationId: card.id,
      action: "LINK_CLAIM",
      backupPath,
      citationCount: locker.citations.length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Citation link failed.";
    return { ok: false, error: message };
  }
}

export function createKimHammerCitationFromProducedEvidence(
  input: Omit<KimHammerCitationCreateInput, "sourceUrl"> & { producedEvidenceLink: string },
  repoRoot: string = process.cwd(),
): KimHammerCitationMutationResult {
  return createKimHammerCitationCard(
    {
      ...input,
      sourceUrl: input.producedEvidenceLink.trim(),
      summary: input.summary?.trim() || `Produced evidence from task ${input.originTaskId ?? "unknown"}`,
    },
    repoRoot,
  );
}

export { KIM_HAMMER_CITATION_REVIEW_STATUSES };

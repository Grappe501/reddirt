import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  loadPublicMediaIntakeQueue,
  PUBLIC_MEDIA_INTAKE_QUEUE_REL,
  type MediaFindingReviewStatus,
  type PublicMediaIntakeFinding,
} from "@/lib/intelligence/publicMediaIntake";

export const PUBLIC_MEDIA_INTAKE_AUDIT_LOG_REL = "data/intelligence/public-media-intake-audit-log.json";
export const PUBLIC_MEDIA_INTAKE_BACKUP_DIR_REL = "data/intelligence/backups";

export type PublicMediaIntakeAuditEntry = {
  auditId: string;
  findingId: string;
  previousStatus: string;
  nextStatus: string;
  operator: string;
  operatorNotes: string;
  changedAt: string;
  changedByRoute: string;
  backupPath: string;
};

export type PublicMediaIntakeAuditLog = {
  version: number;
  generatedAt: string;
  purpose: string;
  entries: PublicMediaIntakeAuditEntry[];
};

export type MediaReviewMutationResult =
  | {
      ok: true;
      auditId: string;
      findingId: string;
      previousStatus: MediaFindingReviewStatus;
      nextStatus: MediaFindingReviewStatus;
      backupPath: string;
    }
  | { ok: false; error: string };

function absPath(repoRoot: string, rel: string): string {
  return path.join(repoRoot, rel);
}

function toPosixRel(repoRoot: string, filePath: string): string {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function readJsonFile<T>(repoRoot: string, rel: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, rel), "utf8")) as T;
}

function writeJsonFile(repoRoot: string, rel: string, data: unknown): void {
  const target = absPath(repoRoot, rel);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function loadPublicMediaIntakeAuditLog(
  repoRoot: string = process.cwd(),
): PublicMediaIntakeAuditLog {
  const abs = absPath(repoRoot, PUBLIC_MEDIA_INTAKE_AUDIT_LOG_REL);
  if (!existsSync(abs)) {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      purpose: "Media intake audit log not initialized.",
      entries: [],
    };
  }
  return readJsonFile<PublicMediaIntakeAuditLog>(repoRoot, PUBLIC_MEDIA_INTAKE_AUDIT_LOG_REL);
}

export function backupMediaIntakeQueueBeforeMutation(
  repoRoot: string = process.cwd(),
): string {
  const sourceAbs = absPath(repoRoot, PUBLIC_MEDIA_INTAKE_QUEUE_REL);
  if (!existsSync(sourceAbs)) {
    throw new Error(`Queue file not found: ${PUBLIC_MEDIA_INTAKE_QUEUE_REL}`);
  }

  const backupDir = absPath(repoRoot, PUBLIC_MEDIA_INTAKE_BACKUP_DIR_REL);
  mkdirSync(backupDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupAbs = path.join(backupDir, `public-media-intake-queue-${stamp}.json`);
  copyFileSync(sourceAbs, backupAbs);
  return toPosixRel(repoRoot, backupAbs);
}

function appendAuditEntry(
  entry: PublicMediaIntakeAuditEntry,
  repoRoot: string,
): void {
  const log = loadPublicMediaIntakeAuditLog(repoRoot);
  log.entries.push(entry);
  log.generatedAt = new Date().toISOString();
  writeJsonFile(repoRoot, PUBLIC_MEDIA_INTAKE_AUDIT_LOG_REL, log);
}

function mutateFinding(
  findingId: string,
  mutator: (finding: PublicMediaIntakeFinding) => PublicMediaIntakeFinding,
  input: {
    operator: string;
    changedByRoute: string;
    operatorNotes?: string;
    nextStatus: MediaFindingReviewStatus;
  },
  repoRoot: string,
): MediaReviewMutationResult {
  const backupPath = backupMediaIntakeQueueBeforeMutation(repoRoot);
  const queue = loadPublicMediaIntakeQueue(repoRoot);
  const index = queue.findings.findIndex((row) => row.findingId === findingId);
  if (index < 0) {
    return { ok: false, error: `Finding not found: ${findingId}` };
  }

  const previous = queue.findings[index]!;
  const previousStatus = previous.reviewStatus;
  queue.findings[index] = mutator(previous);
  queue.generatedAt = new Date().toISOString();
  writeJsonFile(repoRoot, PUBLIC_MEDIA_INTAKE_QUEUE_REL, queue);

  const auditId = `media-intake-audit-${Date.now()}`;
  appendAuditEntry(
    {
      auditId,
      findingId,
      previousStatus,
      nextStatus: input.nextStatus,
      operator: input.operator,
      operatorNotes: input.operatorNotes ?? "",
      changedAt: new Date().toISOString(),
      changedByRoute: input.changedByRoute,
      backupPath,
    },
    repoRoot,
  );

  return {
    ok: true,
    auditId,
    findingId,
    previousStatus,
    nextStatus: input.nextStatus,
    backupPath,
  };
}

export function updateMediaFindingReviewStatus(
  input: {
    findingId: string;
    nextStatus: MediaFindingReviewStatus;
    operator: string;
    operatorNotes?: string;
    changedByRoute: string;
  },
  repoRoot: string = process.cwd(),
): MediaReviewMutationResult {
  return mutateFinding(
    input.findingId,
    (finding) => ({
      ...finding,
      reviewStatus: input.nextStatus,
      operatorNotes: input.operatorNotes ?? finding.operatorNotes,
    }),
    input,
    repoRoot,
  );
}

export function addMediaFindingOperatorNotes(
  input: {
    findingId: string;
    operator: string;
    operatorNotes: string;
    changedByRoute: string;
  },
  repoRoot: string = process.cwd(),
): MediaReviewMutationResult {
  const queue = loadPublicMediaIntakeQueue(repoRoot);
  const finding = queue.findings.find((row) => row.findingId === input.findingId);
  if (!finding) return { ok: false, error: `Finding not found: ${input.findingId}` };

  return mutateFinding(
    input.findingId,
    (row) => ({ ...row, operatorNotes: input.operatorNotes }),
    {
      operator: input.operator,
      changedByRoute: input.changedByRoute,
      operatorNotes: input.operatorNotes,
      nextStatus: finding.reviewStatus,
    },
    repoRoot,
  );
}

export function markFindingDuplicate(
  input: {
    findingId: string;
    duplicateOf: string;
    operator: string;
    changedByRoute: string;
  },
  repoRoot: string = process.cwd(),
): MediaReviewMutationResult {
  return mutateFinding(
    input.findingId,
    (finding) => ({
      ...finding,
      duplicateOf: input.duplicateOf,
      reviewStatus: "DISMISSED",
    }),
    {
      operator: input.operator,
      operatorNotes: `Marked duplicate of ${input.duplicateOf}`,
      changedByRoute: input.changedByRoute,
      nextStatus: "DISMISSED",
    },
    repoRoot,
  );
}

export function archiveFinding(
  input: {
    findingId: string;
    operator: string;
    operatorNotes?: string;
    changedByRoute: string;
  },
  repoRoot: string = process.cwd(),
): MediaReviewMutationResult {
  return updateMediaFindingReviewStatus(
    {
      ...input,
      nextStatus: "ARCHIVED",
    },
    repoRoot,
  );
}

export function appendFindingsToQueue(
  findings: PublicMediaIntakeFinding[],
  repoRoot: string = process.cwd(),
): { appended: number; backupPath: string } {
  const backupPath = backupMediaIntakeQueueBeforeMutation(repoRoot);
  const queue = loadPublicMediaIntakeQueue(repoRoot);
  queue.findings = [...queue.findings, ...findings];
  queue.generatedAt = new Date().toISOString();
  writeJsonFile(repoRoot, PUBLIC_MEDIA_INTAKE_QUEUE_REL, queue);
  return { appended: findings.length, backupPath };
}

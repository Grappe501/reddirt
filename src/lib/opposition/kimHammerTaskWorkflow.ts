import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import type {
  KimHammerIntelligenceGapsFile,
  KimHammerRetrievalTask,
  KimHammerRetrievalTaskStatus,
  KimHammerTaskPriority,
} from "@/lib/opposition/types/kimHammerEvidence";

export const KIM_HAMMER_INTELLIGENCE_GAPS_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-intelligence-gaps.json";

export const KIM_HAMMER_TASK_AUDIT_LOG_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-task-audit-log.json";

export const KIM_HAMMER_TASK_BACKUP_DIR_REL =
  "data/opposition/kim-hammer-profile/backups";

const TASK_STATUSES: KimHammerRetrievalTaskStatus[] = [
  "NOT_STARTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "BLOCKED",
  "READY_FOR_REVIEW",
  "COMPLETE",
  "ARCHIVED",
];

const TASK_PRIORITIES: KimHammerTaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

export type KimHammerTaskAuditEntry = {
  auditId: string;
  taskId: string;
  sourceFile: string;
  previousStatus: KimHammerRetrievalTaskStatus;
  nextStatus: KimHammerRetrievalTaskStatus;
  operator: string;
  taskNotes: string;
  changedAt: string;
  changedByRoute: string;
  backupPath: string;
  previousOwner?: string;
  nextOwner?: string;
  previousPriority?: KimHammerTaskPriority;
  nextPriority?: KimHammerTaskPriority;
  previousDueDate?: string | null;
  nextDueDate?: string | null;
};

export type KimHammerTaskAuditLog = {
  logVersion: string;
  updatedAt: string;
  entries: KimHammerTaskAuditEntry[];
};

export type KimHammerTaskUpdateInput = {
  taskId: string;
  operator: string;
  changedByRoute: string;
  nextStatus?: KimHammerRetrievalTaskStatus;
  owner?: string;
  priority?: KimHammerTaskPriority;
  dueDate?: string | null;
  completionNotes?: string;
  reviewRequired?: boolean;
  producedEvidenceLink?: string;
};

export type KimHammerTaskUpdateResult =
  | {
      ok: true;
      auditId: string;
      taskId: string;
      sourceFile: string;
      previousStatus: KimHammerRetrievalTaskStatus;
      nextStatus: KimHammerRetrievalTaskStatus;
      backupPath: string;
      retrievalTaskCount: number;
      taskStatusCounts: Record<KimHammerRetrievalTaskStatus, number>;
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

export function backupTaskJsonBeforeMutation(
  sourceRelPath: string,
  repoRoot: string = process.cwd(),
): string {
  const sourceAbs = absPath(repoRoot, sourceRelPath);
  if (!existsSync(sourceAbs)) {
    throw new Error(`Source file not found for backup: ${sourceRelPath}`);
  }

  const backupDirAbs = absPath(repoRoot, KIM_HAMMER_TASK_BACKUP_DIR_REL);
  if (!existsSync(backupDirAbs)) {
    mkdirSync(backupDirAbs, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = path.basename(sourceRelPath, ".json");
  const backupAbs = path.join(backupDirAbs, `${baseName}-${timestamp}.json`);
  copyFileSync(sourceAbs, backupAbs);
  return toPosixRel(repoRoot, backupAbs);
}

export function loadKimHammerTaskAuditLog(
  repoRoot: string = process.cwd(),
): KimHammerTaskAuditLog {
  const rel = KIM_HAMMER_TASK_AUDIT_LOG_REL;
  if (!existsSync(absPath(repoRoot, rel))) {
    return { logVersion: "1.0", updatedAt: new Date().toISOString(), entries: [] };
  }
  return readJsonFile<KimHammerTaskAuditLog>(repoRoot, rel);
}

function appendKimHammerTaskAuditEntry(
  entry: KimHammerTaskAuditEntry,
  repoRoot: string,
): void {
  const log = loadKimHammerTaskAuditLog(repoRoot);
  log.updatedAt = entry.changedAt;
  log.entries = [...log.entries, entry].slice(-500);
  writeJsonFile(repoRoot, KIM_HAMMER_TASK_AUDIT_LOG_REL, log);
}

export function getAllowedTaskTransitions(
  currentStatus: KimHammerRetrievalTaskStatus | undefined,
): KimHammerRetrievalTaskStatus[] {
  const normalized = currentStatus ?? "NOT_STARTED";
  return TASK_STATUSES.filter((status) => status !== normalized);
}

function resolveTaskStatus(task: KimHammerRetrievalTask): KimHammerRetrievalTaskStatus {
  return task.taskStatus ?? "NOT_STARTED";
}

function buildAuditId(taskId: string, changedAt: string): string {
  const slug = taskId.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 80);
  const stamp = changedAt.replace(/[:.]/g, "-");
  return `task-audit-${slug}-${stamp}`;
}

function validateTaskUpdateInput(input: KimHammerTaskUpdateInput): string | null {
  if (!input.taskId?.trim()) return "taskId is required.";
  if (!input.operator?.trim()) return "operator is required.";
  if (!input.changedByRoute?.trim()) return "changedByRoute is required.";

  if (input.nextStatus && !TASK_STATUSES.includes(input.nextStatus)) {
    return `Invalid task status: ${input.nextStatus}`;
  }

  if (input.priority && !TASK_PRIORITIES.includes(input.priority)) {
    return `Invalid priority: ${input.priority}`;
  }

  return null;
}

function taskHasChanges(
  task: KimHammerRetrievalTask,
  input: KimHammerTaskUpdateInput,
): boolean {
  const currentStatus = resolveTaskStatus(task);
  if (input.nextStatus && input.nextStatus !== currentStatus) return true;
  if (input.owner !== undefined && input.owner.trim() !== (task.owner ?? "")) return true;
  if (input.priority !== undefined && input.priority !== task.priority) return true;
  if (input.dueDate !== undefined && input.dueDate !== (task.dueDate ?? null)) return true;
  if (
    input.completionNotes !== undefined &&
    input.completionNotes.trim() !== (task.completionNotes ?? "")
  ) {
    return true;
  }
  if (input.reviewRequired !== undefined && input.reviewRequired !== (task.reviewRequired ?? false)) {
    return true;
  }
  if (input.producedEvidenceLink?.trim()) return true;
  return false;
}

export function updateKimHammerRetrievalTask(
  input: KimHammerTaskUpdateInput,
  repoRoot: string = process.cwd(),
): KimHammerTaskUpdateResult {
  const validationError = validateTaskUpdateInput(input);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const taskId = input.taskId.trim();
  const operator = input.operator.trim();
  const changedAt = new Date().toISOString();

  const gapsFile = readJsonFile<KimHammerIntelligenceGapsFile>(
    repoRoot,
    KIM_HAMMER_INTELLIGENCE_GAPS_REL,
  );
  const task = gapsFile.gaps.find((row) => row.id === taskId);
  if (!task) {
    return { ok: false, error: `Retrieval task not found: ${taskId}` };
  }

  if (!taskHasChanges(task, input)) {
    return { ok: false, error: "Task fields unchanged." };
  }

  const previousStatus = resolveTaskStatus(task);
  const previousOwner = task.owner;
  const previousPriority = task.priority;
  const previousDueDate = task.dueDate ?? null;

  try {
    const backupPath = backupTaskJsonBeforeMutation(KIM_HAMMER_INTELLIGENCE_GAPS_REL, repoRoot);

    if (input.nextStatus) task.taskStatus = input.nextStatus;
    if (input.owner !== undefined) task.owner = input.owner.trim();
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.dueDate !== undefined) task.dueDate = input.dueDate ?? undefined;
    if (input.reviewRequired !== undefined) task.reviewRequired = input.reviewRequired;

    if (input.completionNotes !== undefined) {
      task.completionNotes = input.completionNotes.trim();
    } else if (input.producedEvidenceLink?.trim()) {
      const linkNote = `Produced evidence: ${input.producedEvidenceLink.trim()}`;
      task.completionNotes = task.completionNotes
        ? `${task.completionNotes}\n${linkNote}`
        : linkNote;
    }

    task.lastUpdated = changedAt;
    gapsFile.generatedAt = changedAt;
    writeJsonFile(repoRoot, KIM_HAMMER_INTELLIGENCE_GAPS_REL, gapsFile);

    const nextStatus = resolveTaskStatus(task);
    const auditId = buildAuditId(taskId, changedAt);
    appendKimHammerTaskAuditEntry(
      {
        auditId,
        taskId,
        sourceFile: KIM_HAMMER_INTELLIGENCE_GAPS_REL,
        previousStatus,
        nextStatus,
        operator,
        taskNotes: task.completionNotes ?? "",
        changedAt,
        changedByRoute: input.changedByRoute,
        backupPath,
        previousOwner,
        nextOwner: task.owner,
        previousPriority,
        nextPriority: task.priority,
        previousDueDate,
        nextDueDate: task.dueDate ?? null,
      },
      repoRoot,
    );

    const index = loadKimHammerEvidenceIndex(repoRoot);

    return {
      ok: true,
      auditId,
      taskId,
      sourceFile: KIM_HAMMER_INTELLIGENCE_GAPS_REL,
      previousStatus,
      nextStatus,
      backupPath,
      retrievalTaskCount: index.metrics.retrievalTasks,
      taskStatusCounts: index.metrics.taskStatusCounts,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Task update failed.";
    return { ok: false, error: message };
  }
}

export { TASK_STATUSES, TASK_PRIORITIES };

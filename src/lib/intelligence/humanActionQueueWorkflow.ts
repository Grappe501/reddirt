import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type {
  HumanActionQueueFile,
  HumanActionQueueItem,
  HumanActionStatus,
} from "@/lib/intelligence/types/humanActionQueue";
import { HUMAN_ACTION_QUEUE_REL } from "@/lib/intelligence/types/humanActionQueue";

export const HUMAN_ACTION_QUEUE_AUDIT_LOG_REL = "data/intelligence/human-action-queue-audit-log.json";

export const HUMAN_ACTION_QUEUE_BACKUP_DIR_REL = "data/intelligence/backups";

export type HumanActionQueueAuditEntry = {
  auditId: string;
  actionId: string;
  previousStatus: HumanActionStatus;
  nextStatus: HumanActionStatus;
  operator: string;
  owner: string;
  notes: string;
  changedAt: string;
  changedByRoute: string;
  backupPath: string;
  eventType: "HUMAN_ACTION_CREATED" | "HUMAN_ACTION_UPDATED" | "HUMAN_ACTION_ARCHIVED";
};

export type HumanActionQueueAuditLog = {
  logVersion: string;
  updatedAt: string;
  entries: HumanActionQueueAuditEntry[];
};

export type HumanActionStatusUpdateInput = {
  actionId: string;
  operator: string;
  changedByRoute: string;
  nextStatus: HumanActionStatus;
  owner?: string;
  notes?: string;
};

export type HumanActionStatusUpdateResult =
  | {
      ok: true;
      auditId: string;
      actionId: string;
      previousStatus: HumanActionStatus;
      nextStatus: HumanActionStatus;
      backupPath: string;
    }
  | { ok: false; error: string };

function absPath(repoRoot: string, relPath: string): string {
  return path.join(repoRoot, relPath);
}

function readJson<T>(repoRoot: string, relPath: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, relPath), "utf8")) as T;
}

function writeJson(repoRoot: string, relPath: string, data: unknown): void {
  const abs = absPath(repoRoot, relPath);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function backupQueue(repoRoot: string): string {
  const src = absPath(repoRoot, HUMAN_ACTION_QUEUE_REL);
  if (!existsSync(src)) return "";
  const backupDir = absPath(repoRoot, HUMAN_ACTION_QUEUE_BACKUP_DIR_REL);
  mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(backupDir, `human-action-queue-${stamp}.json`);
  copyFileSync(src, dest);
  return path.relative(repoRoot, dest).split(path.sep).join("/");
}

function loadAuditLog(repoRoot: string): HumanActionQueueAuditLog {
  const abs = absPath(repoRoot, HUMAN_ACTION_QUEUE_AUDIT_LOG_REL);
  if (!existsSync(abs)) {
    return { logVersion: "NSI-15", updatedAt: new Date().toISOString(), entries: [] };
  }
  return readJson<HumanActionQueueAuditLog>(repoRoot, HUMAN_ACTION_QUEUE_AUDIT_LOG_REL);
}

function appendAudit(
  repoRoot: string,
  entry: Omit<HumanActionQueueAuditEntry, "auditId" | "changedAt">,
): string {
  const log = loadAuditLog(repoRoot);
  const auditId = `ha-audit-${Date.now()}-${log.entries.length + 1}`;
  log.entries.unshift({
    ...entry,
    auditId,
    changedAt: new Date().toISOString(),
  });
  log.updatedAt = new Date().toISOString();
  writeJson(repoRoot, HUMAN_ACTION_QUEUE_AUDIT_LOG_REL, log);
  return auditId;
}

function findAction(queue: HumanActionQueueFile, actionId: string): HumanActionQueueItem | undefined {
  return queue.items.find((row) => row.actionId === actionId);
}

function persistQueueUpdate(
  repoRoot: string,
  queue: HumanActionQueueFile,
  action: HumanActionQueueItem,
  audit: Omit<HumanActionQueueAuditEntry, "auditId" | "changedAt" | "eventType"> & {
    eventType: HumanActionQueueAuditEntry["eventType"];
  },
): HumanActionStatusUpdateResult {
  const backupPath = backupQueue(repoRoot);
  const index = queue.items.findIndex((row) => row.actionId === action.actionId);
  if (index < 0) {
    return { ok: false, error: "action_not_found" };
  }
  queue.items[index] = action;
  queue.generatedAt = new Date().toISOString();
  writeJson(repoRoot, HUMAN_ACTION_QUEUE_REL, queue);
  const auditId = appendAudit(repoRoot, { ...audit, backupPath });
  return {
    ok: true,
    auditId,
    actionId: action.actionId,
    previousStatus: audit.previousStatus,
    nextStatus: audit.nextStatus,
    backupPath,
  };
}

export function updateHumanActionStatus(
  input: HumanActionStatusUpdateInput,
  repoRoot: string = process.cwd(),
): HumanActionStatusUpdateResult {
  const queue = readJson<HumanActionQueueFile>(repoRoot, HUMAN_ACTION_QUEUE_REL);
  const action = findAction(queue, input.actionId);
  if (!action) return { ok: false, error: "action_not_found" };

  const previousStatus = action.status;
  action.status = input.nextStatus;
  action.updatedAt = new Date().toISOString();
  if (input.notes?.trim()) {
    action.operatorNotes = input.notes.trim();
  }

  const eventType =
    input.nextStatus === "ARCHIVED" ? "HUMAN_ACTION_ARCHIVED" : "HUMAN_ACTION_UPDATED";

  return persistQueueUpdate(repoRoot, queue, action, {
    actionId: action.actionId,
    previousStatus,
    nextStatus: input.nextStatus,
    operator: input.operator,
    owner: input.owner ?? action.recommendedOwnerRole,
    notes: input.notes ?? "",
    changedByRoute: input.changedByRoute,
    backupPath: "",
    eventType,
  });
}

export function assignHumanActionOwner(
  input: {
    actionId: string;
    operator: string;
    owner: string;
    changedByRoute: string;
    notes?: string;
  },
  repoRoot: string = process.cwd(),
): HumanActionStatusUpdateResult {
  const queue = readJson<HumanActionQueueFile>(repoRoot, HUMAN_ACTION_QUEUE_REL);
  const action = findAction(queue, input.actionId);
  if (!action) return { ok: false, error: "action_not_found" };

  const previousStatus = action.status;
  action.recommendedOwnerRole = input.owner as HumanActionQueueItem["recommendedOwnerRole"];
  action.updatedAt = new Date().toISOString();
  if (input.notes?.trim()) action.operatorNotes = input.notes.trim();

  return persistQueueUpdate(repoRoot, queue, action, {
    actionId: action.actionId,
    previousStatus,
    nextStatus: action.status,
    operator: input.operator,
    owner: input.owner,
    notes: input.notes ?? `Owner assigned: ${input.owner}`,
    changedByRoute: input.changedByRoute,
    backupPath: "",
    eventType: "HUMAN_ACTION_UPDATED",
  });
}

export function addHumanActionNotes(
  input: {
    actionId: string;
    operator: string;
    notes: string;
    changedByRoute: string;
  },
  repoRoot: string = process.cwd(),
): HumanActionStatusUpdateResult {
  const queue = readJson<HumanActionQueueFile>(repoRoot, HUMAN_ACTION_QUEUE_REL);
  const action = findAction(queue, input.actionId);
  if (!action) return { ok: false, error: "action_not_found" };

  const previousStatus = action.status;
  action.operatorNotes = input.notes.trim();
  action.updatedAt = new Date().toISOString();

  return persistQueueUpdate(repoRoot, queue, action, {
    actionId: action.actionId,
    previousStatus,
    nextStatus: action.status,
    operator: input.operator,
    owner: action.recommendedOwnerRole,
    notes: input.notes,
    changedByRoute: input.changedByRoute,
    backupPath: "",
    eventType: "HUMAN_ACTION_UPDATED",
  });
}

export function archiveHumanAction(
  input: {
    actionId: string;
    operator: string;
    changedByRoute: string;
    notes?: string;
  },
  repoRoot: string = process.cwd(),
): HumanActionStatusUpdateResult {
  return updateHumanActionStatus(
    {
      actionId: input.actionId,
      operator: input.operator,
      changedByRoute: input.changedByRoute,
      nextStatus: "ARCHIVED",
      notes: input.notes,
    },
    repoRoot,
  );
}

export function loadHumanActionQueueAuditLog(repoRoot?: string): HumanActionQueueAuditLog {
  return loadAuditLog(repoRoot ?? process.cwd());
}

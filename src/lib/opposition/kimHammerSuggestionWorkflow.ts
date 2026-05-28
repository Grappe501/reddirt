import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { KIM_HAMMER_AI_SUGGESTION_SANDBOX_REL } from "@/lib/opposition/kimHammerSuggestionSandbox";
import type {
  KimHammerAiSuggestion,
  KimHammerAiSuggestionSandboxFile,
  KimHammerSuggestionStatus,
} from "@/lib/opposition/types/kimHammerAiSuggestion";
import {
  getAllowedKimHammerSuggestionTransitions,
  KIM_HAMMER_SUGGESTION_STATUSES,
} from "@/lib/opposition/types/kimHammerAiSuggestion";

export const KIM_HAMMER_SUGGESTION_AUDIT_LOG_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-suggestion-audit-log.json";

export const KIM_HAMMER_SUGGESTION_BACKUP_DIR_REL =
  "data/opposition/kim-hammer-profile/backups";

export type KimHammerSuggestionAuditAction = "DISPOSITION" | "DEFER" | "REOPEN";

export type KimHammerSuggestionAuditEntry = {
  auditId: string;
  suggestionId: string;
  action: KimHammerSuggestionAuditAction;
  previousStatus: KimHammerSuggestionStatus;
  nextStatus: KimHammerSuggestionStatus;
  operator: string;
  notes: string;
  changedAt: string;
  changedByRoute: string;
  backupPath: string;
  sourceFile: string;
};

export type KimHammerSuggestionAuditLog = {
  logVersion: string;
  updatedAt: string;
  entries: KimHammerSuggestionAuditEntry[];
};

export type KimHammerSuggestionDispositionInput = {
  suggestionId: string;
  operator: string;
  changedByRoute: string;
  nextStatus: KimHammerSuggestionStatus;
  operatorNotes?: string;
};

export type KimHammerSuggestionDispositionResult =
  | {
      ok: true;
      auditId: string;
      suggestionId: string;
      previousStatus: KimHammerSuggestionStatus;
      nextStatus: KimHammerSuggestionStatus;
      backupPath: string;
      pendingCount: number;
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

export function backupSuggestionJsonBeforeMutation(
  sourceRelPath: string,
  repoRoot: string = process.cwd(),
): string {
  const sourceAbs = absPath(repoRoot, sourceRelPath);
  if (!existsSync(sourceAbs)) {
    throw new Error(`Source file not found for backup: ${sourceRelPath}`);
  }

  const backupDirAbs = absPath(repoRoot, KIM_HAMMER_SUGGESTION_BACKUP_DIR_REL);
  if (!existsSync(backupDirAbs)) {
    mkdirSync(backupDirAbs, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = path.basename(sourceRelPath, ".json");
  const backupAbs = path.join(backupDirAbs, `${baseName}-${timestamp}.json`);
  copyFileSync(sourceAbs, backupAbs);
  return toPosixRel(repoRoot, backupAbs);
}

export function loadKimHammerSuggestionAuditLog(
  repoRoot: string = process.cwd(),
): KimHammerSuggestionAuditLog {
  if (!existsSync(absPath(repoRoot, KIM_HAMMER_SUGGESTION_AUDIT_LOG_REL))) {
    return { logVersion: "1.0", updatedAt: new Date().toISOString(), entries: [] };
  }
  return readJsonFile<KimHammerSuggestionAuditLog>(repoRoot, KIM_HAMMER_SUGGESTION_AUDIT_LOG_REL);
}

function appendKimHammerSuggestionAuditEntry(
  entry: KimHammerSuggestionAuditEntry,
  repoRoot: string,
): void {
  const log = loadKimHammerSuggestionAuditLog(repoRoot);
  log.updatedAt = entry.changedAt;
  log.entries = [...log.entries, entry].slice(-500);
  writeJsonFile(repoRoot, KIM_HAMMER_SUGGESTION_AUDIT_LOG_REL, log);
}

function buildAuditId(suggestionId: string, changedAt: string): string {
  const slug = suggestionId.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 80);
  const stamp = changedAt.replace(/[:.]/g, "-");
  return `sugg-audit-${slug}-${stamp}`;
}

function resolveAuditAction(
  previousStatus: KimHammerSuggestionStatus,
  nextStatus: KimHammerSuggestionStatus,
): KimHammerSuggestionAuditAction {
  if (nextStatus === "DEFERRED") return "DEFER";
  if (previousStatus !== "PENDING" && nextStatus === "PENDING") return "REOPEN";
  return "DISPOSITION";
}

export function getAllowedSuggestionTransitions(
  currentStatus: KimHammerSuggestionStatus,
): KimHammerSuggestionStatus[] {
  return getAllowedKimHammerSuggestionTransitions(currentStatus);
}

export function updateKimHammerSuggestionDisposition(
  input: KimHammerSuggestionDispositionInput,
  repoRoot: string = process.cwd(),
): KimHammerSuggestionDispositionResult {
  if (!input.suggestionId?.trim()) return { ok: false, error: "suggestionId is required." };
  if (!input.operator?.trim()) return { ok: false, error: "operator is required." };
  if (!input.changedByRoute?.trim()) return { ok: false, error: "changedByRoute is required." };

  if (!KIM_HAMMER_SUGGESTION_STATUSES.includes(input.nextStatus)) {
    return { ok: false, error: `Invalid suggestion status: ${input.nextStatus}` };
  }

  const sandbox = readJsonFile<KimHammerAiSuggestionSandboxFile>(
    repoRoot,
    KIM_HAMMER_AI_SUGGESTION_SANDBOX_REL,
  );
  const suggestion = sandbox.suggestions.find((row) => row.id === input.suggestionId.trim());
  if (!suggestion) {
    return { ok: false, error: `Suggestion not found: ${input.suggestionId}` };
  }

  const previousStatus = suggestion.status;
  if (previousStatus === input.nextStatus) {
    const notesChanged =
      input.operatorNotes !== undefined &&
      input.operatorNotes.trim() !== (suggestion.operatorNotes ?? "");
    if (!notesChanged) {
      return { ok: false, error: "Suggestion disposition unchanged." };
    }
  } else {
    const allowed = getAllowedSuggestionTransitions(previousStatus);
    if (!allowed.includes(input.nextStatus)) {
      return {
        ok: false,
        error: `Transition not allowed: ${previousStatus} → ${input.nextStatus}`,
      };
    }
  }

  const changedAt = new Date().toISOString();

  try {
    const backupPath = backupSuggestionJsonBeforeMutation(
      KIM_HAMMER_AI_SUGGESTION_SANDBOX_REL,
      repoRoot,
    );

    suggestion.status = input.nextStatus;
    suggestion.operator = input.operator.trim();
    if (input.operatorNotes !== undefined) {
      suggestion.operatorNotes = input.operatorNotes.trim();
    }
    suggestion.dispositionedAt =
      input.nextStatus === "PENDING" ? null : changedAt;
    suggestion.lastUpdated = changedAt;
    sandbox.generatedAt = changedAt;

    writeJsonFile(repoRoot, KIM_HAMMER_AI_SUGGESTION_SANDBOX_REL, sandbox);

    const auditId = buildAuditId(suggestion.id, changedAt);
    appendKimHammerSuggestionAuditEntry(
      {
        auditId,
        suggestionId: suggestion.id,
        action: resolveAuditAction(previousStatus, input.nextStatus),
        previousStatus,
        nextStatus: input.nextStatus,
        operator: input.operator.trim(),
        notes: suggestion.operatorNotes ?? "",
        changedAt,
        changedByRoute: input.changedByRoute,
        backupPath,
        sourceFile: KIM_HAMMER_AI_SUGGESTION_SANDBOX_REL,
      },
      repoRoot,
    );

    const pendingCount = sandbox.suggestions.filter((row) => row.status === "PENDING").length;

    return {
      ok: true,
      auditId,
      suggestionId: suggestion.id,
      previousStatus,
      nextStatus: input.nextStatus,
      backupPath,
      pendingCount,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Suggestion disposition failed.";
    return { ok: false, error: message };
  }
}

export { KIM_HAMMER_SUGGESTION_STATUSES };

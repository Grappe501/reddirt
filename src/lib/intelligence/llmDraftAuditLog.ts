import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export const LLM_DRAFT_AUDIT_LOG_REL = "data/intelligence/llm-draft-audit-log.json";

export type LlmDraftAuditEventType =
  | "LLM_DRAFT_CREATED"
  | "LLM_DRAFT_REVIEWED"
  | "LLM_DRAFT_PROMOTED"
  | "LLM_DRAFT_ARCHIVED";

export type LlmDraftAuditEntry = {
  auditId: string;
  eventType: LlmDraftAuditEventType;
  draftId: string;
  draftType: string;
  reviewer: string;
  route: string;
  model: string;
  previousStatus: string;
  nextStatus: string;
  timestamp: string;
  warnings: string[];
  promotionTarget: string | null;
  notes: string;
};

export type LlmDraftAuditLog = {
  version: number;
  generatedAt: string;
  purpose: string;
  entries: LlmDraftAuditEntry[];
};

function absPath(repoRoot: string, rel: string): string {
  return path.join(repoRoot, rel);
}

export function loadLlmDraftAuditLog(repoRoot: string = process.cwd()): LlmDraftAuditLog {
  const abs = absPath(repoRoot, LLM_DRAFT_AUDIT_LOG_REL);
  if (!existsSync(abs)) {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      purpose: "LLM draft audit log not initialized.",
      entries: [],
    };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as LlmDraftAuditLog;
}

function writeAuditLog(repoRoot: string, log: LlmDraftAuditLog): void {
  const target = absPath(repoRoot, LLM_DRAFT_AUDIT_LOG_REL);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(log, null, 2)}\n`, "utf8");
}

export function appendLlmDraftAuditEntry(
  input: Omit<LlmDraftAuditEntry, "auditId" | "timestamp">,
  repoRoot: string = process.cwd(),
): LlmDraftAuditEntry {
  const log = loadLlmDraftAuditLog(repoRoot);
  const entry: LlmDraftAuditEntry = {
    ...input,
    auditId: `llm-audit-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
  };
  log.entries.unshift(entry);
  log.generatedAt = new Date().toISOString();
  writeAuditLog(repoRoot, log);
  return entry;
}

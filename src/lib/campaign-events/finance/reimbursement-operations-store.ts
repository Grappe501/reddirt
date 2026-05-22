import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { ReimbursementMonthOperations, ReimbursementAuditEntry } from "./reimbursement-operations-types";

const OPS_DIR = "data/campaign-events/finance/reimbursement-ops";

function opsPath(month: string, repoRoot?: string) {
  return path.join(repoRoot ?? process.cwd(), OPS_DIR, `${month}.json`);
}

export async function loadReimbursementMonthOperations(month: string): Promise<ReimbursementMonthOperations | null> {
  const p = opsPath(month);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(await readFile(p, "utf8")) as ReimbursementMonthOperations;
  } catch {
    return null;
  }
}

export async function saveReimbursementMonthOperations(ops: ReimbursementMonthOperations): Promise<void> {
  const p = opsPath(ops.month);
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, JSON.stringify({ ...ops, updatedAt: new Date().toISOString() }, null, 2), "utf8");
}

export async function appendReimbursementAudit(
  month: string,
  entry: Omit<ReimbursementAuditEntry, "at"> & { at?: string },
  patch?: Partial<ReimbursementMonthOperations>,
): Promise<ReimbursementMonthOperations> {
  const existing = (await loadReimbursementMonthOperations(month)) ?? {
    month,
    pipelineStatus: "draft" as const,
    auditHistory: [],
    exceptions: [],
    updatedAt: new Date().toISOString(),
  };
  const full: ReimbursementMonthOperations = {
    ...existing,
    ...patch,
    auditHistory: [{ at: entry.at ?? new Date().toISOString(), actor: entry.actor, action: entry.action, note: entry.note, recordId: entry.recordId }, ...existing.auditHistory].slice(0, 80),
    updatedAt: new Date().toISOString(),
  };
  await saveReimbursementMonthOperations(full);
  return full;
}

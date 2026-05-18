import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ComplianceReconciliationMatch } from "./reconciliation-workbench-types";

export type ReconciliationAuditEvent = {
  id: string;
  matchId: string;
  action: string;
  actorInitials: string;
  note?: string;
  before?: Partial<ComplianceReconciliationMatch>;
  after?: Partial<ComplianceReconciliationMatch>;
  createdAt: string;
};

const AUDIT_PATH = path.join(process.cwd(), "data", "compliance", "reconciliation", "audit-log.json");

export async function loadReconciliationAuditLog(): Promise<ReconciliationAuditEvent[]> {
  try {
    return JSON.parse(await readFile(AUDIT_PATH, "utf8")) as ReconciliationAuditEvent[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function appendReconciliationAuditEvent(input: Omit<ReconciliationAuditEvent, "id" | "createdAt">): Promise<ReconciliationAuditEvent> {
  const events = await loadReconciliationAuditLog();
  const event: ReconciliationAuditEvent = {
    ...input,
    id: `recon-audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorInitials: input.actorInitials.trim().toUpperCase() || "UNK",
    createdAt: new Date().toISOString(),
  };
  await mkdir(path.dirname(AUDIT_PATH), { recursive: true });
  await writeFile(AUDIT_PATH, `${JSON.stringify([event, ...events].slice(0, 5000), null, 2)}\n`, "utf8");
  return event;
}

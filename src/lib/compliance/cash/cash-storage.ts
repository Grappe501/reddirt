import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { defaultCashContributionPolicy } from "./cash-policy";
import { validateStagedCashContribution } from "./cash-validation";
import type {
  CashContributionPolicy,
  CashDepositBatch,
  CashIntakeAuditLog,
  CashIntakeInput,
  StagedCashContribution,
} from "./types";

const CASH_DIR = path.join(process.cwd(), "data", "compliance", "cash");
const CONTRIBUTIONS_PATH = path.join(CASH_DIR, "staged-cash-contributions.json");
const AUDIT_LOG_PATH = path.join(CASH_DIR, "cash-intake-audit-log.json");
const BATCHES_PATH = path.join(CASH_DIR, "cash-deposit-batches.json");
const POLICY_PATH = path.join(CASH_DIR, "cash-policy.json");

export async function loadCashPolicy(): Promise<CashContributionPolicy> {
  return readJson<CashContributionPolicy>(POLICY_PATH, defaultCashContributionPolicy);
}

export async function saveCashPolicy(policy: CashContributionPolicy): Promise<void> {
  await writeJson(POLICY_PATH, policy);
}

export async function loadStagedCashContributions(): Promise<StagedCashContribution[]> {
  return readJson<StagedCashContribution[]>(CONTRIBUTIONS_PATH, []);
}

export async function saveStagedCashContributions(contributions: StagedCashContribution[]): Promise<void> {
  await writeJson(CONTRIBUTIONS_PATH, contributions);
}

export async function loadCashAuditLog(): Promise<CashIntakeAuditLog[]> {
  return readJson<CashIntakeAuditLog[]>(AUDIT_LOG_PATH, []);
}

export async function appendCashAuditLog(entry: CashIntakeAuditLog): Promise<void> {
  const log = await loadCashAuditLog();
  await writeJson(AUDIT_LOG_PATH, [entry, ...log].slice(0, 1000));
}

export async function loadCashDepositBatches(): Promise<CashDepositBatch[]> {
  return readJson<CashDepositBatch[]>(BATCHES_PATH, []);
}

export async function saveCashDepositBatches(batches: CashDepositBatch[]): Promise<void> {
  await writeJson(BATCHES_PATH, batches);
}

export async function createStagedCashContribution(input: CashIntakeInput): Promise<StagedCashContribution> {
  const [existing, policy] = await Promise.all([loadStagedCashContributions(), loadCashPolicy()]);
  const now = new Date().toISOString();
  const base = {
    id: `cash-${now.replace(/[-:.TZ]/g, "").slice(0, 14)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    createdByInitials: input.createdByInitials.trim().toUpperCase(),
    contributionDate: input.contributionDate || now.slice(0, 10),
    amount: input.amount,
    donorFullName: clean(input.donorFullName),
    donorFirstName: clean(input.donorFirstName),
    donorLastName: clean(input.donorLastName),
    donorAddress1: clean(input.donorAddress1),
    donorCity: clean(input.donorCity),
    donorState: clean(input.donorState),
    donorZip: clean(input.donorZip),
    donorPhone: clean(input.donorPhone),
    donorEmail: clean(input.donorEmail),
    employer: clean(input.employer),
    occupation: clean(input.occupation),
    idChecked: Boolean(input.idChecked),
    idCheckMethod: input.idCheckMethod ?? (input.idChecked ? "visual_check" : "not_recorded"),
    idCheckedByInitials: clean(input.idCheckedByInitials),
    eventSource: clean(input.eventSource),
    notes: clean(input.notes),
    billPhotoPath: input.billPhotoPath,
    donorSlipPhotoPath: input.donorSlipPhotoPath,
    ocrExtraction: input.ocrExtraction,
    approvalStatus: "not_approved" as const,
  };
  const validation = validateStagedCashContribution({ contribution: base, existing, policy });
  const auditEntry: CashIntakeAuditLog = {
    id: `cash-audit-${Date.now()}`,
    cashContributionId: base.id,
    actorInitials: base.createdByInitials,
    action: "cash_intake_created",
    after: redactCashContribution({ ...base, complianceStatus: validation.complianceStatus, warnings: validation.warnings, auditLogIds: [] }),
    createdAt: now,
  };
  const contribution: StagedCashContribution = {
    ...base,
    complianceStatus: validation.complianceStatus,
    warnings: validation.warnings,
    auditLogIds: [auditEntry.id],
  };
  await saveStagedCashContributions([contribution, ...existing]);
  await appendCashAuditLog(auditEntry);
  return contribution;
}

export async function updateCashContributionStatus(input: {
  id: string;
  actorInitials: string;
  action: "approved" | "rejected" | "converted_to_contribution";
  note?: string;
}): Promise<StagedCashContribution> {
  const contributions = await loadStagedCashContributions();
  const existing = contributions.find((contribution) => contribution.id === input.id);
  if (!existing) throw new Error("Cash contribution not found.");
  const now = new Date().toISOString();
  const next: StagedCashContribution = {
    ...existing,
    approvalStatus:
      input.action === "approved" || input.action === "converted_to_contribution"
        ? "approved"
        : input.action === "rejected"
          ? "rejected"
          : existing.approvalStatus,
    complianceStatus:
      input.action === "converted_to_contribution"
        ? "converted_to_contribution"
        : input.action === "approved"
          ? "approved"
          : input.action === "rejected"
            ? "rejected"
            : existing.complianceStatus,
  };
  if (input.action === "converted_to_contribution" && !canConvert(next)) {
    throw new Error("Cash contribution is not ready for conversion.");
  }
  const auditEntry: CashIntakeAuditLog = {
    id: `cash-audit-${Date.now()}`,
    cashContributionId: existing.id,
    actorInitials: input.actorInitials.trim().toUpperCase(),
    action: input.action,
    before: redactCashContribution(existing),
    after: redactCashContribution(next),
    note: clean(input.note),
    createdAt: now,
  };
  const saved = { ...next, auditLogIds: [auditEntry.id, ...existing.auditLogIds] };
  await saveStagedCashContributions(contributions.map((contribution) => (contribution.id === input.id ? saved : contribution)));
  await appendCashAuditLog(auditEntry);
  return saved;
}

export async function createCashDepositBatch(input: {
  contributionIds: string[];
  countedCashTotal: number;
  preparedByInitials: string;
  batchDate?: string;
  notes?: string;
}): Promise<CashDepositBatch> {
  const [contributions, batches] = await Promise.all([loadStagedCashContributions(), loadCashDepositBatches()]);
  const selected = contributions.filter((contribution) => input.contributionIds.includes(contribution.id));
  const systemCashTotal = roundMoney(selected.reduce((total, contribution) => total + contribution.amount, 0));
  const countedCashTotal = roundMoney(input.countedCashTotal);
  const variance = roundMoney(countedCashTotal - systemCashTotal);
  const batch: CashDepositBatch = {
    id: `cash-batch-${Date.now()}`,
    batchDate: input.batchDate || new Date().toISOString().slice(0, 10),
    contributionIds: selected.map((contribution) => contribution.id),
    countedCashTotal,
    systemCashTotal,
    variance,
    preparedByInitials: input.preparedByInitials.trim().toUpperCase(),
    status: variance === 0 ? "ready_for_deposit" : "variance_review",
    notes: clean(input.notes),
  };
  const updatedContributions = contributions.map((contribution) =>
    batch.contributionIds.includes(contribution.id) ? { ...contribution, intakeBatchId: batch.id } : contribution,
  );
  await Promise.all([saveCashDepositBatches([batch, ...batches]), saveStagedCashContributions(updatedContributions)]);
  await appendCashAuditLog({
    id: `cash-audit-${Date.now()}`,
    batchId: batch.id,
    actorInitials: batch.preparedByInitials,
    action: variance === 0 ? "batched" : "variance_flagged",
    after: batch,
    createdAt: new Date().toISOString(),
  });
  return batch;
}

function canConvert(contribution: StagedCashContribution): boolean {
  return (
    contribution.approvalStatus === "approved" &&
    contribution.complianceStatus !== "amount_over_cash_limit" &&
    contribution.complianceStatus !== "missing_required_fields"
  );
}

function redactCashContribution(contribution: unknown): unknown {
  if (!contribution || typeof contribution !== "object") return contribution;
  const record = { ...(contribution as Record<string, unknown>) };
  if (typeof record.donorEmail === "string") record.donorEmail = "[email redacted]";
  if (typeof record.donorPhone === "string") record.donorPhone = "[phone redacted]";
  if (typeof record.donorAddress1 === "string") record.donorAddress1 = "[address redacted]";
  return record;
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await writeJson(filePath, fallback);
    return fallback;
  }
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function clean(value: string | undefined): string | undefined {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { detectReceiptDuplicates } from "../ai/receipt-intake-agent/receipt-duplicate-detector";
import { scoreReceiptReadiness } from "../ai/receipt-intake-agent/receipt-readiness-scorer";
import type { ReceiptAuditLog, ReceiptIntakeInput, StagedReceiptExpense } from "./receipt-types";

const RECEIPTS_DIR = path.join(process.cwd(), "data", "compliance", "receipts");
const UPLOADS_DIR = path.join(RECEIPTS_DIR, "uploads");
const RECEIPTS_PATH = path.join(RECEIPTS_DIR, "staged-receipts.json");
const AUDIT_LOG_PATH = path.join(RECEIPTS_DIR, "receipt-audit-log.json");

export async function loadStagedReceipts(): Promise<StagedReceiptExpense[]> {
  return readJson<StagedReceiptExpense[]>(RECEIPTS_PATH, []);
}

export async function saveStagedReceipts(receipts: StagedReceiptExpense[]): Promise<void> {
  await writeJson(RECEIPTS_PATH, receipts);
}

export async function loadReceiptAuditLog(): Promise<ReceiptAuditLog[]> {
  return readJson<ReceiptAuditLog[]>(AUDIT_LOG_PATH, []);
}

export async function appendReceiptAuditLog(entry: ReceiptAuditLog): Promise<void> {
  const log = await loadReceiptAuditLog();
  await writeJson(AUDIT_LOG_PATH, [entry, ...log].slice(0, 1000));
}

export async function createStagedReceipt(input: ReceiptIntakeInput): Promise<StagedReceiptExpense> {
  const existing = await loadStagedReceipts();
  const now = new Date().toISOString();
  const base: StagedReceiptExpense = {
    id: `receipt-${now.replace(/[-:.TZ]/g, "").slice(0, 14)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    createdByInitials: normalizeInitials(input.createdByInitials),
    imagePath: input.imagePath,
    imageHash: input.imageHash,
    sourceFileName: clean(input.sourceFileName),
    extraction: input.extraction,
    vendorName: clean(input.vendorName) ?? input.extraction?.vendorName,
    receiptDate: clean(input.receiptDate) ?? input.extraction?.receiptDate ?? now.slice(0, 10),
    subtotal: maybeMoney(input.subtotal ?? input.extraction?.subtotal),
    tax: maybeMoney(input.tax ?? input.extraction?.tax),
    tip: maybeMoney(input.tip ?? input.extraction?.tip),
    total: roundMoney(input.total || input.extraction?.total || 0),
    tipStatus: input.tipStatus ?? inferTipStatus(input.tip ?? input.extraction?.tip),
    tipVerifiedByInitials: normalizeInitials(input.createdByInitials),
    tipVerificationNote: clean(input.tipVerificationNote),
    paymentMethod: input.paymentMethod ?? input.extraction?.paymentMethod ?? "unknown",
    cardLastFour: clean(input.cardLastFour ?? input.extraction?.cardLastFour),
    checkNumber: clean(input.checkNumber),
    category: input.category ?? input.extraction?.suggestedCategory ?? "unknown",
    businessPurpose: clean(input.businessPurpose ?? input.extraction?.suggestedPurpose),
    reviewStatus: input.reviewStatus ?? "draft",
    approvalStatus: "not_approved",
    reconciliationStatus: "awaiting_bank_match",
    documentationStatus: input.imagePath ? "receipt_attached" : input.extraction ? "receipt_extracted" : "missing_receipt",
    warnings: [],
    auditLogIds: [],
  };
  const readiness = scoreReceiptReadiness(base);
  const duplicateWarnings = detectReceiptDuplicates(base, existing).map((risk) => risk.explanation);
  const receipt: StagedReceiptExpense = {
    ...base,
    reviewStatus: input.reviewStatus ?? readiness.reviewStatus,
    documentationStatus: readiness.documentationStatus,
    warnings: [...readiness.warnings, ...duplicateWarnings],
  };
  const auditEntry: ReceiptAuditLog = {
    id: `receipt-audit-${Date.now()}`,
    receiptId: receipt.id,
    actorInitials: receipt.createdByInitials,
    action: "receipt_draft_created",
    after: redactReceipt(receipt),
    createdAt: now,
  };
  receipt.auditLogIds = [auditEntry.id];
  await saveStagedReceipts([receipt, ...existing]);
  await appendReceiptAuditLog(auditEntry);
  if (duplicateWarnings.length) {
    await appendReceiptAuditLog({
      id: `receipt-audit-${Date.now()}-dup`,
      receiptId: receipt.id,
      actorInitials: receipt.createdByInitials,
      action: "possible_duplicate_flagged",
      note: duplicateWarnings.join(" "),
      createdAt: now,
    });
  }
  return receipt;
}

export async function updateReceiptReview(input: {
  id: string;
  actorInitials: string;
  updates: Partial<StagedReceiptExpense>;
  note?: string;
}): Promise<StagedReceiptExpense> {
  const receipts = await loadStagedReceipts();
  const existing = receipts.find((receipt) => receipt.id === input.id);
  if (!existing) throw new Error("Receipt not found.");
  const next: StagedReceiptExpense = {
    ...existing,
    ...input.updates,
    total: roundMoney(input.updates.total ?? existing.total),
    tip: maybeMoney(input.updates.tip ?? existing.tip),
  };
  const readiness = scoreReceiptReadiness(next);
  next.reviewStatus = input.updates.reviewStatus ?? readiness.reviewStatus;
  next.documentationStatus = input.updates.documentationStatus ?? readiness.documentationStatus;
  next.warnings = [...new Set([...(input.updates.warnings ?? existing.warnings), ...readiness.warnings])];
  const auditEntry: ReceiptAuditLog = {
    id: `receipt-audit-${Date.now()}`,
    receiptId: next.id,
    actorInitials: normalizeInitials(input.actorInitials),
    action: "receipt_review_updated",
    before: redactReceipt(existing),
    after: redactReceipt(next),
    note: input.note,
    createdAt: new Date().toISOString(),
  };
  next.auditLogIds = [auditEntry.id, ...existing.auditLogIds].slice(0, 50);
  await saveStagedReceipts(receipts.map((receipt) => (receipt.id === next.id ? next : receipt)));
  await appendReceiptAuditLog(auditEntry);
  return next;
}

export async function saveReceiptUpload(input: {
  fileName: string;
  arrayBuffer: ArrayBuffer;
  receiptId?: string;
}): Promise<{ imagePath: string; imageHash: string; sourceFileName: string }> {
  await mkdir(UPLOADS_DIR, { recursive: true });
  const bytes = Buffer.from(input.arrayBuffer);
  const imageHash = createHash("sha256").update(bytes).digest("hex");
  const safeName = input.fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "receipt-upload";
  const fileName = `${input.receiptId ?? `receipt-${Date.now()}`}-${safeName}`;
  const absolutePath = path.join(UPLOADS_DIR, fileName);
  await writeFile(absolutePath, bytes);
  return {
    imagePath: path.relative(process.cwd(), absolutePath).replace(/\\/g, "/"),
    imageHash,
    sourceFileName: input.fileName,
  };
}

function redactReceipt(receipt: StagedReceiptExpense): StagedReceiptExpense {
  return {
    ...receipt,
    imagePath: receipt.imagePath ? "[receipt upload path redacted]" : undefined,
    cardLastFour: receipt.cardLastFour ? `****${receipt.cardLastFour.slice(-4)}` : undefined,
  };
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

function normalizeInitials(value: string): string {
  return (value.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "UNK");
}

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function maybeMoney(value: number | undefined): number | undefined {
  return value === undefined ? undefined : roundMoney(value);
}

function roundMoney(value: number): number {
  return Math.round(Number(value || 0) * 100) / 100;
}

function inferTipStatus(tip: number | undefined) {
  return tip && tip > 0 ? "tip_on_receipt" : "not_sure";
}

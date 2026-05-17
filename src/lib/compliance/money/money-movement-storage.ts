import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  ComplianceVendor,
  MoneyAuditLog,
  MoneyCoverageSummary,
  MoneyMovementInput,
  StagedMoneyMovement,
} from "./money-movement-types";

const MONEY_DIR = path.join(process.cwd(), "data", "compliance", "money");
const MOVEMENTS_PATH = path.join(MONEY_DIR, "staged-money-movements.json");
const AUDIT_LOG_PATH = path.join(MONEY_DIR, "money-audit-log.json");
const VENDORS_PATH = path.join(MONEY_DIR, "vendors.json");

export async function loadStagedMoneyMovements(): Promise<StagedMoneyMovement[]> {
  return readJson<StagedMoneyMovement[]>(MOVEMENTS_PATH, []);
}

export async function saveStagedMoneyMovements(movements: StagedMoneyMovement[]): Promise<void> {
  await writeJson(MOVEMENTS_PATH, movements);
}

export async function loadMoneyAuditLog(): Promise<MoneyAuditLog[]> {
  return readJson<MoneyAuditLog[]>(AUDIT_LOG_PATH, []);
}

export async function appendMoneyAuditLog(entry: MoneyAuditLog): Promise<void> {
  const log = await loadMoneyAuditLog();
  await writeJson(AUDIT_LOG_PATH, [entry, ...log].slice(0, 1000));
}

export async function loadComplianceVendors(): Promise<ComplianceVendor[]> {
  return readJson<ComplianceVendor[]>(VENDORS_PATH, []);
}

export async function saveComplianceVendors(vendors: ComplianceVendor[]): Promise<void> {
  await writeJson(VENDORS_PATH, vendors);
}

export async function createStagedMoneyMovement(input: MoneyMovementInput): Promise<StagedMoneyMovement> {
  const existing = await loadStagedMoneyMovements();
  const now = new Date().toISOString();
  const normalized = normalizeMoneyMovement(input, now);
  const movement: StagedMoneyMovement = {
    ...normalized,
    id: `money-${now.replace(/[-:.TZ]/g, "").slice(0, 14)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  await saveStagedMoneyMovements([movement, ...existing]);
  await appendMoneyAuditLog({
    id: `money-audit-${Date.now()}`,
    moneyMovementId: movement.id,
    actorInitials: input.actorInitials.trim().toUpperCase() || "UNK",
    action: "intake_created",
    after: redactMoneyMovement(movement),
    sourceRoute: input.sourceRoute,
    createdAt: now,
  });
  return movement;
}

export async function createComplianceVendor(input: {
  name: string;
  entityType: ComplianceVendor["entityType"];
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  email?: string;
  phone?: string;
  w9Status?: ComplianceVendor["w9Status"];
  contractStatus?: ComplianceVendor["contractStatus"];
  ytdPaid?: number;
  notes?: string;
  actorInitials: string;
}): Promise<ComplianceVendor> {
  const vendors = await loadComplianceVendors();
  const ytdPaid = roundMoney(input.ytdPaid ?? 0);
  const vendor: ComplianceVendor = {
    id: `vendor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim(),
    entityType: input.entityType,
    address1: clean(input.address1),
    city: clean(input.city),
    state: clean(input.state),
    zip: clean(input.zip),
    email: clean(input.email),
    phone: clean(input.phone),
    w9Status: input.w9Status ?? "missing",
    contractStatus: input.contractStatus ?? "missing",
    ytdPaid,
    likely1099Required: ytdPaid >= 600 && input.entityType !== "business",
    notes: clean(input.notes),
  };
  await saveComplianceVendors([vendor, ...vendors]);
  await appendMoneyAuditLog({
    id: `money-audit-${Date.now()}`,
    vendorId: vendor.id,
    actorInitials: input.actorInitials.trim().toUpperCase() || "UNK",
    action: "vendor_created",
    after: redactVendor(vendor),
    sourceRoute: "/admin/compliance/vendors/new",
    createdAt: new Date().toISOString(),
  });
  return vendor;
}

export async function buildMoneyCoverageSummary(): Promise<MoneyCoverageSummary> {
  const [movements, vendors] = await Promise.all([loadStagedMoneyMovements(), loadComplianceVendors()]);
  return {
    totalMoneyInStaged: sum(movements.filter((movement) => movement.direction === "in")),
    totalMoneyOutStaged: sum(movements.filter((movement) => movement.direction === "out")),
    approvedMoneyIn: sum(movements.filter((movement) => movement.direction === "in" && movement.approvalStatus === "approved")),
    approvedMoneyOut: sum(movements.filter((movement) => movement.direction === "out" && movement.approvalStatus === "approved")),
    unreconciledDeposits: movements.filter((movement) => movement.direction === "in" && !movement.bankTransactionId).length,
    unreconciledExpenses: movements.filter((movement) => movement.direction === "out" && !movement.bankTransactionId).length,
    processorFees: movements.filter((movement) => movement.category === "processor_fee").length,
    cashPendingDeposit: movements.filter((movement) => movement.category === "contribution_cash" && !movement.depositDate).length,
    checksPendingDeposit: movements.filter((movement) => movement.category === "contribution_check" && !movement.depositDate).length,
    missingW9: vendors.filter((vendor) => vendor.w9Status === "missing" && vendor.likely1099Required).length,
    missingReceipts: movements.filter((movement) => movement.documentationStatus === "missing_receipt" || movement.documentationStatus === "missing_invoice").length,
    missingDonorInfo: movements.filter((movement) => movement.documentationStatus === "missing_donor_info").length,
    readyForFilingCount: movements.filter((movement) => movement.reviewStatus === "ready_for_approval" && movement.missingFields.length === 0).length,
    needsReviewCount: movements.filter((movement) => movement.reviewStatus === "needs_review" || movement.reviewStatus === "staged").length,
  };
}

function normalizeMoneyMovement(input: MoneyMovementInput, now: string): Omit<StagedMoneyMovement, "id" | "createdAt" | "updatedAt"> {
  const missingFields = computeMissingFields(input);
  const warnings = computeWarnings(input, missingFields);
  return {
    source: input.source,
    direction: input.direction,
    category: input.category,
    amount: roundMoney(input.amount),
    grossAmount: maybeMoney(input.grossAmount),
    feeAmount: maybeMoney(input.feeAmount),
    netAmount: maybeMoney(input.netAmount),
    transactionDate: clean(input.transactionDate) || now.slice(0, 10),
    postedDate: clean(input.postedDate),
    depositDate: clean(input.depositDate),
    name: clean(input.name),
    entityType: input.entityType ?? "unknown",
    address1: clean(input.address1),
    city: clean(input.city),
    state: clean(input.state),
    zip: clean(input.zip),
    employer: clean(input.employer),
    occupation: clean(input.occupation),
    paymentMethod: input.paymentMethod ?? "unknown",
    checkNumber: clean(input.checkNumber),
    processorTransactionId: clean(input.processorTransactionId),
    bankTransactionId: clean(input.bankTransactionId),
    description: clean(input.description),
    purpose: clean(input.purpose),
    memo: clean(input.memo),
    documentationStatus: input.documentationStatus ?? inferDocumentationStatus(input, missingFields),
    reviewStatus: input.reviewStatus ?? (missingFields.length || warnings.length ? "needs_review" : "ready_for_approval"),
    approvalStatus: input.approvalStatus ?? "not_approved",
    warnings,
    missingFields,
    sourceRefs: input.sourceRefs ?? [],
  };
}

function computeMissingFields(input: MoneyMovementInput): string[] {
  const required = [
    !input.amount || input.amount <= 0 ? "amount" : undefined,
    !input.transactionDate && !input.postedDate ? "date" : undefined,
  ];
  if (input.direction === "in" && input.category.toString().startsWith("contribution")) {
    required.push(!input.name ? "contributor name" : undefined);
    required.push(!input.address1 || !input.city || !input.state || !input.zip ? "donor address" : undefined);
    if (input.category !== "contribution_in_kind") {
      required.push(!input.employer ? "employer" : undefined);
      required.push(!input.occupation ? "occupation" : undefined);
    }
  }
  if (input.direction === "out") {
    required.push(!input.name ? "payee/vendor name" : undefined);
    required.push(!input.purpose ? "purpose" : undefined);
  }
  if (input.category === "contribution_check") required.push(!input.checkNumber ? "check number recommended" : undefined);
  return required.filter((field): field is string => Boolean(field));
}

function computeWarnings(input: MoneyMovementInput, missingFields: string[]): string[] {
  return [
    ...missingFields.map((field) => `Missing ${field}.`),
    input.category === "processor_fee" && !input.bankTransactionId ? "Processor fee not matched to bank yet." : undefined,
    input.category === "staff_1099_payment" && input.documentationStatus !== "complete" ? "1099/staff payment needs W-9 and contract review." : undefined,
    input.category === "bank_fee" && !input.bankTransactionId ? "Bank fee needs bank transaction match." : undefined,
  ].filter((warning): warning is string => Boolean(warning));
}

function inferDocumentationStatus(input: MoneyMovementInput, missingFields: string[]): StagedMoneyMovement["documentationStatus"] {
  if (missingFields.some((field) => field.includes("donor") || field.includes("employer") || field.includes("occupation"))) return "missing_donor_info";
  if (input.category === "staff_1099_payment" || input.category === "vendor_payment") {
    if (input.documentationStatus) return input.documentationStatus;
    return "missing_invoice";
  }
  if (input.direction === "out" && !input.purpose) return "needs_review";
  return missingFields.length ? "needs_review" : "complete";
}

function redactMoneyMovement(movement: StagedMoneyMovement): StagedMoneyMovement {
  return { ...movement, address1: movement.address1 ? "[address redacted]" : undefined };
}

function redactVendor(vendor: ComplianceVendor): ComplianceVendor {
  return { ...vendor, address1: vendor.address1 ? "[address redacted]" : undefined, email: vendor.email ? "[email redacted]" : undefined, phone: vendor.phone ? "[phone redacted]" : undefined };
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
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function maybeMoney(value: number | undefined): number | undefined {
  return value === undefined ? undefined : roundMoney(value);
}

function roundMoney(value: number): number {
  return Math.round(Number(value || 0) * 100) / 100;
}

function sum(movements: StagedMoneyMovement[]): number {
  return roundMoney(movements.reduce((total, movement) => total + movement.amount, 0));
}

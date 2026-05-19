import { execSync } from "node:child_process";
import path from "node:path";
import { listApril26ImageFiles } from "../approval/april26-source";
import { loadApprovalItems } from "../approval/approval-storage";
import type { ApprovalItem } from "../approval/approval-types";
import { loadStagedReceipts } from "../receipts/receipt-storage";
import type { StagedReceiptExpense } from "../receipts/receipt-types";
import { loadComplianceVendors, loadStagedMoneyMovements } from "../money/money-movement-storage";
import type { StagedMoneyMovement } from "../money/money-movement-types";
import { loadBankAnalyses } from "../storage";
import type { AprilExpenditureInventory } from "./april-expenditure-inventory-types";
import {
  filterAprilExpenditures,
  inferVendorFromDescription,
  isApril2026,
  loadFullAprilLedgerRows,
  type FullLedgerRow,
} from "./parse-ledger-rows-full";

const AMOUNT_TOLERANCE = 0.01;
const DATE_WINDOW_DAYS = 3;

export type UploadedCheckRecord = AprilExpenditureInventory["uploadedChecks"][number];
export type LedgerExpenditureRecord = AprilExpenditureInventory["ledgerExpenditures"][number];

function commitBase(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function parseCheckNumberFromPath(relativePath: string): string | null {
  const base = path.basename(relativePath, path.extname(relativePath));
  const m =
    base.match(/(?:check|ck)[\s_-]*#?(\d{3,8})/i) ??
    base.match(/\b(\d{4,6})\b/);
  return m?.[1] ?? null;
}

function fieldValue(item: ApprovalItem, key: string): string | null {
  const f = item.fields.find((x) => x.key === key);
  if (f?.value == null) return null;
  const text = String(f.value).trim();
  return text ? text : null;
}

function formatAddress(parts: Array<string | undefined | null>): { present: boolean; value: string | null } {
  const joined = parts.filter((p) => p?.trim()).join(", ");
  return { present: Boolean(joined), value: joined || null };
}

function vendorAddressByName(vendors: Awaited<ReturnType<typeof loadComplianceVendors>>, name: string | null) {
  if (!name) return { present: false, value: null as string | null };
  const vendor = vendors.find((v) => v.name.toLowerCase() === name.toLowerCase());
  if (!vendor) return { present: false, value: null };
  return formatAddress([vendor.address1, vendor.city, vendor.state, vendor.zip]);
}

function redactPayee(label: string | null | undefined, kind: "contribution" | "expense"): string | null {
  if (!label?.trim()) return null;
  if (kind === "contribution") return "Contribution check (payee redacted)";
  return label.trim().slice(0, 120);
}

function absAmount(n: number): number {
  return Math.round(Math.abs(n) * 100) / 100;
}

function daysBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const da = Date.parse(a);
  const db = Date.parse(b);
  if (Number.isNaN(da) || Number.isNaN(db)) return null;
  return Math.round(Math.abs(da - db) / 86_400_000);
}

function extractAmountFromFields(item: ApprovalItem): number | null {
  const raw = fieldValue(item, "amount") ?? fieldValue(item, "total");
  if (!raw) return item.amount ?? null;
  const n = Number(raw.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? absAmount(n) : item.amount ?? null;
}

async function collectUploadedChecks(): Promise<UploadedCheckRecord[]> {
  const [images, approvalItems, receipts, movements, bankAnalyses, vendors] = await Promise.all([
    listApril26ImageFiles(),
    loadApprovalItems(),
    loadStagedReceipts(),
    loadStagedMoneyMovements(),
    loadBankAnalyses(),
    loadComplianceVendors(),
  ]);

  const records: UploadedCheckRecord[] = [];
  const seen = new Set<string>();

  const push = (record: UploadedCheckRecord) => {
    if (seen.has(record.id)) return;
    seen.add(record.id);
    records.push(record);
  };

  for (const image of images.filter((i) => i.kind === "check")) {
    const checkNumber = parseCheckNumberFromPath(image.relativePath);
    push({
      id: `img-${image.relativePath}`,
      checkNumber,
      date: null,
      payeeVendor: null,
      amount: null,
      memoPurpose: null,
      sourceFileName: path.basename(image.relativePath),
      sourceChunkId: image.relativePath,
      evidenceStatus: "image_on_disk",
      addressPresent: false,
      addressValue: null,
      missingFields: ["amount", "date", "payee", "address"],
      confidence: "none",
      recordKind: "check_image",
    });
  }

  for (const item of approvalItems.filter((i) => i.source === "check_contribution" || i.source === "receipt_expense")) {
    const isContribution = item.source === "check_contribution";
    const payee = redactPayee(item.entityName ?? fieldValue(item, "vendorName"), isContribution ? "contribution" : "expense");
    const addr = isContribution
      ? { present: false, value: null }
      : formatAddress([
          fieldValue(item, "address1"),
          fieldValue(item, "city"),
          fieldValue(item, "state"),
          fieldValue(item, "zip"),
        ]);
    const vendorAddr = !addr.present ? vendorAddressByName(vendors, payee) : addr;
    push({
      id: `approval-${item.id}`,
      checkNumber: fieldValue(item, "checkNumber"),
      date: fieldValue(item, "transactionDate") ?? fieldValue(item, "receiptDate"),
      payeeVendor: payee,
      amount: extractAmountFromFields(item),
      memoPurpose: fieldValue(item, "purpose") ?? fieldValue(item, "businessPurpose"),
      sourceFileName: item.evidence.find((e) => e.path)?.path ?? item.sourceRecordId,
      sourceChunkId: item.sourceRecordId,
      evidenceStatus: item.evidence.length ? "approval_evidence_linked" : "approval_queue_only",
      addressPresent: vendorAddr.present,
      addressValue: vendorAddr.value,
      missingFields: item.missingFields.length ? item.missingFields : item.blockers,
      confidence: item.confidenceScore > 0.7 ? "high" : item.confidenceScore > 0.3 ? "medium" : "low",
      recordKind: "approval_item",
    });
  }

  for (const receipt of receipts.filter(isCheckOrAprilReceipt)) {
    const addr = formatAddress([
      receipt.extraction?.city,
      receipt.extraction?.state,
      receipt.vendorName,
    ]);
    const vendorAddr = vendorAddressByName(vendors, receipt.vendorName ?? null);
    const address = addr.present ? addr : vendorAddr;
    push({
      id: `receipt-${receipt.id}`,
      checkNumber: receipt.checkNumber ?? null,
      date: receipt.receiptDate ?? null,
      payeeVendor: receipt.vendorName ?? null,
      amount: receipt.total ?? null,
      memoPurpose: receipt.businessPurpose ?? receipt.category,
      sourceFileName: receipt.sourceFileName ?? receipt.imagePath ?? receipt.id,
      sourceChunkId: receipt.id,
      evidenceStatus: receipt.documentationStatus,
      addressPresent: address.present,
      addressValue: address.value,
      missingFields: receipt.warnings.filter((w) => /missing|address|vendor/i.test(w)).slice(0, 8),
      confidence: receipt.extraction?.confidence ?? "low",
      recordKind: "staged_receipt",
    });
  }

  for (const movement of movements.filter(isCheckMovementApril)) {
    const isOut = movement.direction === "out";
    const payee = redactPayee(
      movement.name,
      movement.category.startsWith("contribution") ? "contribution" : "expense",
    );
    const addr = formatAddress([movement.address1, movement.city, movement.state, movement.zip]);
    const vendorAddr = vendorAddressByName(vendors, movement.name ?? null);
    const address = isOut && addr.present ? addr : isOut ? vendorAddr : { present: false, value: null };
    push({
      id: `movement-${movement.id}`,
      checkNumber: movement.checkNumber ?? null,
      date: movement.transactionDate ?? movement.postedDate ?? null,
      payeeVendor: payee,
      amount: absAmount(movement.amount),
      memoPurpose: movement.purpose ?? movement.memo ?? movement.description ?? null,
      sourceFileName: movement.sourceRefs[0] ?? movement.id,
      sourceChunkId: movement.id,
      evidenceStatus: movement.documentationStatus,
      addressPresent: address.present,
      addressValue: address.value,
      missingFields: movement.missingFields,
      confidence: movement.missingFields.length ? "low" : "medium",
      recordKind: "money_movement",
    });
  }

  for (const analysis of bankAnalyses) {
    for (const txn of analysis.stagedTransactions) {
      if (!txn.checkNumber?.trim()) continue;
      if (txn.transactionType !== "expense" && (txn.debit ?? 0) >= 0) continue;
      const date = txn.postedDate ?? null;
      if (date && !isApril2026(normalizeDateSafe(date))) continue;
      push({
        id: `bank-staged-${txn.id}`,
        checkNumber: txn.checkNumber,
        date,
        payeeVendor: inferVendorFromDescription(txn.description ?? ""),
        amount: absAmount(txn.amount ?? txn.debit ?? 0),
        memoPurpose: txn.description ?? null,
        sourceFileName: `bank-import-${analysis.batch.id}`,
        sourceChunkId: txn.id,
        evidenceStatus: txn.reconciliationStatus,
        addressPresent: false,
        addressValue: null,
        missingFields: ["address"],
        confidence: "medium",
        recordKind: "bank_staged",
      });
    }
  }

  return records;
}

function normalizeDateSafe(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

function isCheckOrAprilReceipt(receipt: StagedReceiptExpense): boolean {
  if (receipt.paymentMethod === "campaign_check" || receipt.checkNumber) return true;
  if (receipt.receiptDate?.startsWith("2026-04")) return true;
  return Boolean(receipt.imagePath?.toLowerCase().includes("check"));
}

function isCheckMovementApril(m: StagedMoneyMovement): boolean {
  const date = m.transactionDate ?? m.postedDate ?? "";
  const inApril = date.startsWith("2026-04");
  if (!inApril && m.paymentMethod !== "check" && !m.checkNumber) return false;
  return (
    inApril &&
    (m.paymentMethod === "check" ||
      Boolean(m.checkNumber) ||
      m.category === "contribution_check" ||
      m.category === "vendor_payment")
  );
}

function buildLedgerExpenditures(rows: FullLedgerRow[]): LedgerExpenditureRecord[] {
  return filterAprilExpenditures(rows).map((row) => {
    const amount = absAmount(row.amount);
    const vendor = inferVendorFromDescription(row.description);
    const missing: string[] = [];
    if (!vendor) missing.push("vendor/payee");
    if (!row.refCheckNumber && /check/i.test(row.description)) missing.push("check number");
    return {
      id: `ledger-${row.sourceKind}-${row.sourceId}`,
      date: row.normalizedDate,
      refCheckNumber: row.refCheckNumber,
      description: row.description,
      amount,
      memo: row.memo || null,
      category: row.category || null,
      possibleVendorPayee: vendor,
      matchedUploadedCheck: "no",
      matchedSourceId: null,
      addressPresent: false,
      missingFields: missing,
      reconciliationStatus: "unreviewed",
      sourceRowNumber: row.rowNumber,
      provenance: row.provenance,
    };
  });
}

type MatchCandidate = {
  uploadedId: string;
  ledgerId: string;
  kind: "exact" | "likely";
  notes: string;
  amountDelta: number | null;
  dateDeltaDays: number | null;
};

function scoreMatch(uploaded: UploadedCheckRecord, ledger: LedgerExpenditureRecord): MatchCandidate | null {
  if (uploaded.amount == null || !ledger.amount) return null;
  const amountDelta = Math.abs(uploaded.amount - ledger.amount);
  const dateDeltaDays = daysBetween(uploaded.date, ledger.date);
  const checkMismatch =
    uploaded.checkNumber &&
    ledger.refCheckNumber &&
    uploaded.checkNumber !== ledger.refCheckNumber;

  const amountOk = amountDelta <= AMOUNT_TOLERANCE;
  const dateOk = dateDeltaDays == null || dateDeltaDays <= DATE_WINDOW_DAYS;

  if (checkMismatch && amountOk) {
    return {
      uploadedId: uploaded.id,
      ledgerId: ledger.id,
      kind: "likely",
      notes: "Amount matches but check/ref numbers differ",
      amountDelta,
      dateDeltaDays,
    };
  }

  if (amountOk && dateOk && uploaded.checkNumber && ledger.refCheckNumber && uploaded.checkNumber === ledger.refCheckNumber) {
    return {
      uploadedId: uploaded.id,
      ledgerId: ledger.id,
      kind: "exact",
      notes: "Amount, date window, and check/ref number align",
      amountDelta,
      dateDeltaDays,
    };
  }

  if (amountOk && dateOk) {
    return {
      uploadedId: uploaded.id,
      ledgerId: ledger.id,
      kind: "exact",
      notes: "Amount and date align within tolerance",
      amountDelta,
      dateDeltaDays,
    };
  }

  if (amountOk && (dateDeltaDays == null || dateDeltaDays > DATE_WINDOW_DAYS)) {
    return {
      uploadedId: uploaded.id,
      ledgerId: ledger.id,
      kind: "likely",
      notes: "Amount matches; date outside window or missing",
      amountDelta,
      dateDeltaDays,
    };
  }

  if (amountDelta > AMOUNT_TOLERANCE && amountDelta <= 5 && dateOk) {
    return {
      uploadedId: uploaded.id,
      ledgerId: ledger.id,
      kind: "likely",
      notes: "Near amount match within $5",
      amountDelta,
      dateDeltaDays,
    };
  }

  return null;
}

export async function buildAprilExpenditureInventory(): Promise<AprilExpenditureInventory> {
  const [uploadedChecks, ledgerRows] = await Promise.all([collectUploadedChecks(), loadFullAprilLedgerRows()]);
  const ledgerExpenditures = buildLedgerExpenditures(ledgerRows);

  const candidates: MatchCandidate[] = [];
  for (const uploaded of uploadedChecks) {
    for (const ledger of ledgerExpenditures) {
      const match = scoreMatch(uploaded, ledger);
      if (match) candidates.push(match);
    }
  }

  const byUploaded = new Map<string, MatchCandidate[]>();
  for (const c of candidates) {
    const list = byUploaded.get(c.uploadedId) ?? [];
    list.push(c);
    byUploaded.set(c.uploadedId, list);
  }

  const exactPairs = new Set<string>();
  const likelyPairs = new Set<string>();
  const matchTable: AprilExpenditureInventory["matchTable"] = [];

  for (const [uploadedId, list] of byUploaded) {
    const exact = list.filter((c) => c.kind === "exact");
    const likely = list.filter((c) => c.kind === "likely");
    if (exact.length > 1) {
      matchTable.push({
        matchKind: "duplicate",
        uploadedCheckId: uploadedId,
        ledgerExpenditureId: null,
        notes: `${exact.length} exact ledger matches — manual review required`,
        amountDelta: null,
        dateDeltaDays: null,
      });
      continue;
    }
    if (exact.length === 1) {
      const c = exact[0];
      exactPairs.add(`${c.uploadedId}|${c.ledgerId}`);
      const ledger = ledgerExpenditures.find((l) => l.id === c.ledgerId)!;
      const uploaded = uploadedChecks.find((u) => u.id === c.uploadedId)!;
      ledger.matchedUploadedCheck = "yes";
      ledger.matchedSourceId = uploaded.id;
      ledger.reconciliationStatus = "matched_uploaded_check";
      matchTable.push({
        matchKind: "exact",
        uploadedCheckId: c.uploadedId,
        ledgerExpenditureId: c.ledgerId,
        notes: c.notes,
        amountDelta: c.amountDelta,
        dateDeltaDays: c.dateDeltaDays,
      });
      if (c.amountDelta && c.amountDelta > AMOUNT_TOLERANCE) {
        matchTable.push({
          matchKind: "amount_mismatch",
          uploadedCheckId: c.uploadedId,
          ledgerExpenditureId: c.ledgerId,
          notes: "Flagged despite pairing — amount delta exceeds tolerance",
          amountDelta: c.amountDelta,
          dateDeltaDays: c.dateDeltaDays,
        });
      }
      continue;
    }
    if (likely.length > 1) {
      matchTable.push({
        matchKind: "ambiguous",
        uploadedCheckId: uploadedId,
        ledgerExpenditureId: null,
        notes: `${likely.length} possible ledger matches — do not auto-resolve`,
        amountDelta: null,
        dateDeltaDays: null,
      });
      const ledger = ledgerExpenditures.find((l) => likely[0].ledgerId === l.id);
      if (ledger) {
        ledger.matchedUploadedCheck = "possible";
        ledger.matchedSourceId = uploadedId;
      }
      continue;
    }
    if (likely.length === 1) {
      const c = likely[0];
      likelyPairs.add(`${c.uploadedId}|${c.ledgerId}`);
      const ledger = ledgerExpenditures.find((l) => l.id === c.ledgerId)!;
      ledger.matchedUploadedCheck = "possible";
      ledger.matchedSourceId = c.uploadedId;
      matchTable.push({
        matchKind: "likely",
        uploadedCheckId: c.uploadedId,
        ledgerExpenditureId: c.ledgerId,
        notes: c.notes,
        amountDelta: c.amountDelta,
        dateDeltaDays: c.dateDeltaDays,
      });
      if (c.dateDeltaDays != null && c.dateDeltaDays > DATE_WINDOW_DAYS) {
        matchTable.push({
          matchKind: "date_mismatch",
          uploadedCheckId: c.uploadedId,
          ledgerExpenditureId: c.ledgerId,
          notes: "Possible match but date gap exceeds window",
          amountDelta: c.amountDelta,
          dateDeltaDays: c.dateDeltaDays,
        });
      }
    }
  }

  for (const uploaded of uploadedChecks) {
    const matched = [...exactPairs, ...likelyPairs].some((key) => key.startsWith(`${uploaded.id}|`));
    if (!matched) {
      matchTable.push({
        matchKind: "unmatched_uploaded",
        uploadedCheckId: uploaded.id,
        ledgerExpenditureId: null,
        notes: uploaded.recordKind === "check_image" ? "Check image only — may be contribution deposit" : "No ledger expenditure paired",
        amountDelta: null,
        dateDeltaDays: null,
      });
    }
  }

  for (const ledger of ledgerExpenditures) {
    if (ledger.matchedUploadedCheck === "no") {
      matchTable.push({
        matchKind: "unmatched_ledger",
        uploadedCheckId: null,
        ledgerExpenditureId: ledger.id,
        notes: "April bank debit with no uploaded check/receipt pairing",
        amountDelta: null,
        dateDeltaDays: null,
      });
    }
  }

  const addressGaps: AprilExpenditureInventory["addressGaps"] = [];
  const addGap = (gap: AprilExpenditureInventory["addressGaps"][number]) => {
    addressGaps.push(gap);
  };

  for (const uploaded of uploadedChecks) {
    if (uploaded.addressPresent) continue;
    if (uploaded.recordKind === "check_image" && !uploaded.payeeVendor) {
      addGap({
        payeeVendor: uploaded.payeeVendor ?? "(check image — payee unknown)",
        amount: uploaded.amount,
        date: uploaded.date,
        checkRef: uploaded.checkNumber,
        source: uploaded.sourceChunkId,
        whyNeeded: "Expenditure or contribution documentation may require payee address when identified",
        addressFieldStatus: "not_extracted",
      });
      continue;
    }
    if (uploaded.payeeVendor && !uploaded.addressPresent) {
      addGap({
        payeeVendor: uploaded.payeeVendor,
        amount: uploaded.amount,
        date: uploaded.date,
        checkRef: uploaded.checkNumber,
        source: uploaded.sourceFileName,
        whyNeeded: "Vendor/payee address missing for expenditure reporting",
        addressFieldStatus: "missing",
      });
    }
  }

  for (const ledger of ledgerExpenditures.filter((l) => !l.addressPresent && l.possibleVendorPayee)) {
    addGap({
      payeeVendor: ledger.possibleVendorPayee ?? "(unknown)",
      amount: ledger.amount,
      date: ledger.date,
      checkRef: ledger.refCheckNumber,
      source: ledger.provenance,
      whyNeeded: "Ledger expenditure without vendor address on file",
      addressFieldStatus: "ledger_only",
    });
  }

  const operatorReviewList: AprilExpenditureInventory["operatorReviewList"] = [];

  for (const uploaded of uploadedChecks.filter((u) => u.recordKind === "check_image")) {
    operatorReviewList.push({
      action: "confirm_check_exists",
      summary: `Confirm check image: ${uploaded.sourceFileName}`,
      referenceIds: [uploaded.id],
    });
  }

  for (const gap of addressGaps) {
    operatorReviewList.push({
      action: "find_address",
      summary: `Find address for ${gap.payeeVendor}${gap.amount != null ? ` ($${gap.amount.toFixed(2)})` : ""}`,
      referenceIds: [gap.source],
    });
  }

  for (const row of matchTable.filter((m) => m.matchKind === "amount_mismatch")) {
    operatorReviewList.push({
      action: "check_amount_mismatch",
      summary: `Check amount mismatch: uploaded ${row.uploadedCheckId} vs ledger ${row.ledgerExpenditureId}`,
      referenceIds: [row.uploadedCheckId, row.ledgerExpenditureId].filter(Boolean) as string[],
    });
  }

  for (const row of matchTable.filter((m) => m.matchKind === "unmatched_ledger")) {
    operatorReviewList.push({
      action: "resolve_unmatched_ledger",
      summary: `Resolve unmatched ledger line ${row.ledgerExpenditureId}`,
      referenceIds: [row.ledgerExpenditureId].filter(Boolean) as string[],
    });
  }

  for (const row of matchTable.filter((m) => m.matchKind === "unmatched_uploaded")) {
    operatorReviewList.push({
      action: "resolve_unmatched_check",
      summary: `Uploaded check not on ledger: ${row.uploadedCheckId}`,
      referenceIds: [row.uploadedCheckId].filter(Boolean) as string[],
    });
  }

  for (const row of matchTable.filter((m) => m.matchKind === "ambiguous")) {
    operatorReviewList.push({
      action: "review_ambiguous_match",
      summary: row.notes,
      referenceIds: [row.uploadedCheckId].filter(Boolean) as string[],
    });
  }

  for (const uploaded of uploadedChecks.filter((u) => u.payeeVendor?.includes("redacted"))) {
    operatorReviewList.push({
      action: "verify_payee",
      summary: `Verify payee from source document for ${uploaded.sourceFileName}`,
      referenceIds: [uploaded.id],
    });
  }

  const exactMatchCount = matchTable.filter((m) => m.matchKind === "exact").length;
  const likelyMatchCount = matchTable.filter((m) => m.matchKind === "likely").length;
  const unmatchedUploadedChecks = matchTable.filter((m) => m.matchKind === "unmatched_uploaded").length;
  const unmatchedLedgerExpenditures = matchTable.filter((m) => m.matchKind === "unmatched_ledger").length;

  return {
    generatedAt: new Date().toISOString(),
    commitBase: commitBase(),
    summary: {
      uploadedCheckCount: uploadedChecks.length,
      ledgerExpenditureCount: ledgerExpenditures.length,
      exactMatchCount,
      likelyMatchCount,
      unmatchedUploadedChecks,
      unmatchedLedgerExpenditures,
      missingAddressCount: addressGaps.length,
      ambiguousMatchCount: matchTable.filter((m) => m.matchKind === "ambiguous").length,
    },
    uploadedChecks,
    ledgerExpenditures,
    matchTable,
    addressGaps,
    operatorReviewList: operatorReviewList.slice(0, 200),
  };
}

export async function loadAprilExpenditureInventorySummary(): Promise<AprilExpenditureInventory["summary"] | null> {
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(path.join(process.cwd(), "data", "compliance", "ai", "april-expenditure-inventory.json"), "utf8");
    const parsed = JSON.parse(raw) as AprilExpenditureInventory;
    return parsed.summary;
  } catch {
    const built = await buildAprilExpenditureInventory();
    return built.summary;
  }
}

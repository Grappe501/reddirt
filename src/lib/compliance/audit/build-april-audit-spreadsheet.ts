import { buildAprilAuditChecklist } from "../ai/completion-engine/build-april-audit-checklist";
import { buildAprilExpenditureInventory } from "../inventory/build-april-expenditure-inventory";
import { buildBankReconciliationRehearsal } from "../imports/bank-reconciliation-rehearsal";
import { loadApprovalItems } from "../approval/approval-storage";
import { loadOzarkForwardAuctionDonations } from "../in-kind/ozark-forward-auction-donations";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getEntryMissingRequired, type AprilCheckSosWorkbook } from "../checks/april-check-sos-workbook.shared";
import type { AprilAuditCsvRow } from "./april-audit-csv";
import { APRIL_AUDIT_MAIN_COLUMNS } from "./april-audit-csv";

export type AprilAuditSpreadsheetPackage = {
  generatedAt: string;
  mainRows: AprilAuditCsvRow[];
  checksRows: AprilAuditCsvRow[];
  ledgerRows: AprilAuditCsvRow[];
  addressRows: AprilAuditCsvRow[];
  unmatchedRows: AprilAuditCsvRow[];
  inKindRows: AprilAuditCsvRow[];
  reconciliationRows: AprilAuditCsvRow[];
  summary: {
    mainRowCount: number;
    checks: number;
    ledger: number;
    addresses: number;
    unmatched: number;
    inKind: number;
    reconciliation: number;
    sosCheckEntries: number;
    ruleReviewItems: number;
  };
};

function baseRow(partial: Partial<AprilAuditCsvRow> & Pick<AprilAuditCsvRow, "audit_id" | "workflow_area" | "record_type">): AprilAuditCsvRow {
  const missing = String(partial.missing_fields ?? "");
  const criticalMissing = /amount|date|payee|address|vision|Pair to April/i.test(missing);
  const addressPresent =
    partial.address_present === "yes" || partial.address_present === true
      ? "yes"
      : partial.address_present === "n/a"
        ? "n/a"
        : "no";
  return {
    source_file: "",
    source_chunk: "",
    source_route: "",
    date: "",
    check_ref: "",
    amount: "",
    payee_or_vendor: "",
    description: "",
    memo: "",
    category: "",
    address_value: "",
    missing_fields: missing,
    match_status: "",
    matched_record_id: "",
    evidence_status: "",
    confidence: "",
    filing_blocker_reason: "",
    audit_action: "",
    human_answer: "",
    operator_notes: "",
    reviewed_by: "",
    reviewed_at: "",
    ready_for_import: criticalMissing ? "no" : "pending_review",
    ready_for_filing: "no",
    ...partial,
    address_present: addressPresent,
  };
}

async function loadSosWorkbookFromDisk(): Promise<AprilCheckSosWorkbook | null> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "compliance", "checks", "april-check-sos-entries.json"),
      "utf8",
    );
    const parsed = JSON.parse(raw) as AprilCheckSosWorkbook;
    return parsed.entries ? parsed : null;
  } catch {
    return null;
  }
}

export async function buildAprilAuditSpreadsheetPackage(): Promise<AprilAuditSpreadsheetPackage> {
  const [inventory, rehearsal, approvalItems, inKind, sosWorkbook] = await Promise.all([
    buildAprilExpenditureInventory(),
    buildBankReconciliationRehearsal(),
    loadApprovalItems(),
    loadOzarkForwardAuctionDonations(),
    loadSosWorkbookFromDisk(),
  ]);

  const checklist = buildAprilAuditChecklist(inventory);
  const mainRows: AprilAuditCsvRow[] = [];
  const checksRows: AprilAuditCsvRow[] = [];
  const ledgerRows: AprilAuditCsvRow[] = [];
  const addressRows: AprilAuditCsvRow[] = [];
  const unmatchedRows: AprilAuditCsvRow[] = [];
  const inKindRows: AprilAuditCsvRow[] = [];
  const reconciliationRows: AprilAuditCsvRow[] = [];

  for (const c of checklist.checks) {
    const row = baseRow({
      audit_id: c.auditNumber,
      workflow_area: "checks",
      record_type: "check_record",
      source_file: c.payeeOrDescription,
      source_chunk: c.sourceId,
      source_route: "/admin/compliance/checks/sos-entry",
      date: c.date ?? "",
      check_ref: c.checkRef ?? "",
      amount: c.amount ?? "",
      payee_or_vendor: c.payeeOrDescription,
      description: c.payeeOrDescription,
      missing_fields: c.whatWeNeed.join("; "),
      match_status: c.matchStatus,
      evidence_status: c.whatWeHave.join("; "),
      audit_action: c.auditAction,
      filing_blocker_reason: c.matchStatus.includes("unmatched") ? "Unmatched check or missing fields" : "",
    });
    checksRows.push(row);
    mainRows.push(row);
  }

  if (sosWorkbook) {
    for (const e of sosWorkbook.entries) {
      const missing = getEntryMissingRequired(e).join("; ");
      const row = baseRow({
        audit_id: `SOS-${e.id.slice(0, 12)}`,
        workflow_area: "checks",
        record_type: "sos_check_entry",
        source_file: e.imageRelativePath,
        source_chunk: e.id,
        source_route: "/admin/compliance/checks/sos-entry",
        date: e.fields.checkDate ?? e.fields.receivedDate ?? "",
        check_ref: e.fields.checkNumber ?? "",
        amount: e.fields.amount ?? "",
        payee_or_vendor: e.fields.contributorFullName ?? "",
        description: `Check ${e.checkIndexOnImage} of ${e.checksOnImageCount} on image`,
        memo: e.fields.memo ?? "",
        address_present: e.fields.address1 ? "yes" : "no",
        address_value: [e.fields.address1, e.fields.city, e.fields.state, e.fields.zip].filter(Boolean).join(", "),
        missing_fields: missing,
        match_status: e.reviewed ? "reviewed" : e.extractedAt ? "extracted" : "not_extracted",
        evidence_status: e.extraction?.confidence ?? "",
        confidence: e.extraction?.confidence ?? "",
        audit_action: "Verify on physical check; copy to SOS",
        ready_for_import: missing ? "no" : e.reviewed ? "yes" : "pending_review",
      });
      checksRows.push(row);
      mainRows.push(row);
    }
  }

  for (const e of checklist.expenditures) {
    const row = baseRow({
      audit_id: e.auditNumber,
      workflow_area: "ledger",
      record_type: "ledger_expenditure",
      source_file: "bank-april-2026.csv",
      source_chunk: e.sourceId,
      source_route: "/admin/compliance/reconciliation",
      date: e.date ?? "",
      check_ref: e.checkRef ?? "",
      amount: e.amount ?? "",
      payee_or_vendor: e.payeeOrDescription,
      description: e.payeeOrDescription,
      missing_fields: e.whatWeNeed.join("; "),
      match_status: e.matchStatus,
      evidence_status: e.whatWeHave.join("; "),
      audit_action: e.auditAction,
      filing_blocker_reason: e.matchStatus === "no" ? "Ledger line missing documentation" : "",
    });
    ledgerRows.push(row);
    mainRows.push(row);
  }

  for (const [i, gap] of inventory.addressGaps.entries()) {
    const row = baseRow({
      audit_id: `ADDR-${String(i + 1).padStart(3, "0")}`,
      workflow_area: "address",
      record_type: "missing_address",
      source_file: gap.source,
      source_chunk: gap.checkRef ?? "",
      source_route: "/admin/compliance/audit/april-2026-missing-addresses.csv",
      date: gap.date ?? "",
      check_ref: gap.checkRef ?? "",
      amount: gap.amount ?? "",
      payee_or_vendor: gap.payeeVendor,
      description: gap.whyNeeded,
      address_present: "no",
      address_value: "",
      missing_fields: "address",
      audit_action: "Confirm vendor; add address from source only — do not invent",
      filing_blocker_reason: "Missing vendor/payee address",
    });
    addressRows.push(row);
    mainRows.push(row);
  }

  for (const m of inventory.matchTable.filter((x) => x.matchKind !== "exact")) {
    const row = baseRow({
      audit_id: `UNM-${m.uploadedCheckId ?? m.ledgerExpenditureId ?? "row"}`,
      workflow_area: "reconciliation",
      record_type: "match_exception",
      source_chunk: [m.uploadedCheckId, m.ledgerExpenditureId].filter(Boolean).join(" / "),
      source_route: "/admin/compliance/reconciliation",
      match_status: m.matchKind,
      matched_record_id: m.ledgerExpenditureId ?? m.uploadedCheckId ?? "",
      description: m.notes,
      audit_action: "Treasurer confirms match manually — no auto-match",
      filing_blocker_reason: "Unmatched or ambiguous pairing",
    });
    unmatchedRows.push(row);
    mainRows.push(row);
  }

  for (const r of inKind.rows) {
    const row = baseRow({
      audit_id: `IK-${r.itemNumber}`,
      workflow_area: "in_kind",
      record_type: "auction_donation_line",
      source_file: r.sourceImage,
      source_route: "/admin/compliance/in-kind/ozark-auction",
      payee_or_vendor: r.donorName,
      amount: r.estimatedValueUsd,
      description: r.itemTitle,
      missing_fields: [r.phone ? "" : "phone", r.address ? "" : "address"].filter(Boolean).join("; "),
      match_status: r.statusNotes ? "has_notes" : "open",
      evidence_status: "ozark_auction_csv",
      audit_action: "Enter in SOS in-kind; verify against photo",
      operator_notes: [r.statusNotes, r.itemDescription].filter(Boolean).join(" · "),
    });
    inKindRows.push(row);
    mainRows.push(row);
  }

  for (const img of ["att.EakxU1jYtX133ku7f1haPlwKIeW1uh5D0_jy_qCfwKM.jpg", "att.JT8KlqSSQyejhBqimYNRHyp-Nvsv2y9zWP9X0UezblE.jpg", "att.RABoBz2uoaeAo8ruzwIHQJClwu2hdMHjyhh1XTFt44s.jpg"]) {
    const item = approvalItems.find((a) => a.subtitle?.includes(img));
    const row = baseRow({
      audit_id: `IK-PHOTO-${img.slice(4, 12)}`,
      workflow_area: "in_kind",
      record_type: "in_kind_evidence_photo",
      source_file: img,
      source_route: "/admin/compliance/approval/april-2026-compliance-review?filter=in_kind",
      description: "Ozark Forward auction donation list photo",
      match_status: item?.status ?? "not_in_queue",
      evidence_status: item ? "approval_queue" : "missing_queue_item",
      audit_action: "Approve photo as evidence after line items entered",
      ready_for_import: "no",
    });
    inKindRows.push(row);
    mainRows.push(row);
  }

  for (const a of rehearsal.ambiguous) {
    const row = baseRow({
      audit_id: `RECON-AMB-${a.bankRowNumber}`,
      workflow_area: "reconciliation",
      record_type: "bank_ambiguous",
      source_file: "bank-april-2026.csv",
      source_route: "/admin/compliance/reconciliation",
      date: a.bankDate,
      amount: a.bankAmount,
      description: a.bankMemo,
      match_status: "ambiguous",
      matched_record_id: a.payoutKey,
      audit_action: rehearsal.operatorNextSteps[0] ?? "Resolve ambiguous bank match manually",
      filing_blocker_reason: "Ambiguous bank reconciliation",
    });
    reconciliationRows.push(row);
    mainRows.push(row);
  }

  for (const u of rehearsal.unmatchedBank) {
    const row = baseRow({
      audit_id: `RECON-BANK-${u.rowNumber}`,
      workflow_area: "reconciliation",
      record_type: "bank_unmatched",
      source_file: "bank-april-2026.csv",
      source_route: "/admin/compliance/reconciliation",
      date: u.date,
      amount: u.amount,
      description: u.memo,
      match_status: "unmatched_bank",
      audit_action: "Investigate bank credit with no payout batch match",
      filing_blocker_reason: "Unmatched bank line",
    });
    reconciliationRows.push(row);
    mainRows.push(row);
  }

  const ruleItems = approvalItems.filter((i) => i.source === "rule_review");
  for (const item of ruleItems) {
    const row = baseRow({
      audit_id: `RULE-${item.id.slice(-8)}`,
      workflow_area: "rule_review",
      record_type: "rule_topic",
      source_chunk: item.id,
      source_route: "/admin/compliance/rules",
      description: item.title,
      missing_fields: item.missingFields.join("; "),
      match_status: item.status,
      evidence_status: String(item.evidence.length),
      confidence: String(item.confidenceScore),
      audit_action: "Human rule review — cannot batch approve",
      filing_blocker_reason: "Rule topic not verified",
      ready_for_import: "no",
      ready_for_filing: "no",
    });
    mainRows.push(row);
  }

  return {
    generatedAt: new Date().toISOString(),
    mainRows,
    checksRows,
    ledgerRows,
    addressRows,
    unmatchedRows,
    inKindRows,
    reconciliationRows,
    summary: {
      mainRowCount: mainRows.length,
      checks: checksRows.length,
      ledger: ledgerRows.length,
      addresses: addressRows.length,
      unmatched: unmatchedRows.length,
      inKind: inKindRows.length,
      reconciliation: reconciliationRows.length,
      sosCheckEntries: sosWorkbook?.entries.length ?? 0,
      ruleReviewItems: ruleItems.length,
    },
  };
}

export { APRIL_AUDIT_MAIN_COLUMNS };

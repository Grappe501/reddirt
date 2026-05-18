import { loadStagedCashContributions } from "../cash/cash-storage";
import { buildComplianceTasks } from "../tasks/build-compliance-tasks";
import { loadComplianceVendors, loadStagedMoneyMovements } from "../money/money-movement-storage";
import { loadStagedReceipts } from "../receipts/receipt-storage";
import { loadReconciliationMatches } from "../reconciliation/reconciliation-workbench-storage";
import { loadBankAnalyses, loadGoodChangeAnalyses } from "../storage";
import { auditComplianceRuleCorpus } from "../knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "../knowledge/load-compliance-rule-corpus";
import { prepareApprovalItemAi } from "./approval-ai-prep";
import type { ApprovalField, ApprovalItem, ApprovalItemSource, ApprovalQueue } from "./approval-types";
import {
  april26FolderExists,
  goodChangeRowEvidence,
  goodChangeRowToApprovalFields,
  imageEvidence,
  listApril26ImageFiles,
  loadApril26GoodChangeRows,
  mapImageSource,
} from "./april26-source";

export const APRIL_2026_QUEUE_ID = "april-2026-compliance-review";

const TERMINAL: ApprovalItem["status"][] = ["approved", "approved_with_changes", "rejected", "duplicate"];

export async function buildApprovalQueues(): Promise<{ queues: ApprovalQueue[]; items: ApprovalItem[] }> {
  const now = new Date().toISOString();
  const existingItems = await import("./approval-storage").then((m) => m.loadApprovalItems());
  const preserved = new Map(
    existingItems
      .filter((item) => TERMINAL.includes(item.status))
      .map((item) => [`${item.source}:${item.sourceRecordId}`, item]),
  );

  const draftItems: ApprovalItem[] = [];
  let sortOrder = 0;

  const pushItem = (partial: Omit<ApprovalItem, "id" | "queueId" | "sortOrder" | "createdAt" | "updatedAt" | "auditTrailIds"> & { id?: string }) => {
    const key = `${partial.source}:${partial.sourceRecordId}`;
    if (preserved.has(key)) return;
    const id = partial.id ?? `appr-${partial.sourceRecordId}`;
    const base = {
      ...partial,
      id,
      queueId: APRIL_2026_QUEUE_ID,
      status: partial.status ?? "needs_review",
      auditTrailIds: [],
      sortOrder: sortOrder++,
      createdAt: now,
      updatedAt: now,
    };
    const ai = prepareApprovalItemAi(base);
    draftItems.push({ ...base, ...ai });
  };

  const [movements, receipts, cash, vendors, goodChange, bank, matches, tasks, ruleAudit, aprilRows, aprilImages] = await Promise.all([
    loadStagedMoneyMovements(),
    loadStagedReceipts(),
    loadStagedCashContributions(),
    loadComplianceVendors(),
    loadGoodChangeAnalyses(),
    loadBankAnalyses(),
    loadReconciliationMatches(),
    buildComplianceTasks(),
    auditComplianceRuleCorpus(await loadComplianceRuleCorpus()),
    loadApril26GoodChangeRows().catch(() => []),
    listApril26ImageFiles().catch(() => []),
  ]);

  const seenGoodChangeIds = new Set<string>();

  for (const analysis of goodChange) {
    for (const row of analysis.stagedContributions) {
      seenGoodChangeIds.add(row.id);
      pushItem(buildGoodChangeItem(row, analysis.batch.fileName));
    }
  }

  if (await april26FolderExists()) {
    for (const row of aprilRows) {
      const transferId = row.transfer_id;
      if (seenGoodChangeIds.has(transferId)) continue;
      seenGoodChangeIds.add(transferId);
      const amount = Number.parseFloat(row.amount || "0");
      const name = row.donor || `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim();
      pushItem({
        source: "goodchange_contribution",
        sourceRecordId: transferId,
        title: `GoodChange · ${name || "Donor"}`,
        subtitle: row.type,
        amount,
        date: (row.created_on ?? "").slice(0, 10),
        entityName: name || undefined,
        fields: goodChangeRowToApprovalFields(row),
        evidence: goodChangeRowEvidence(row),
        warnings: row.employer_name ? [] : ["Employer missing on row"],
        blockers: [],
        missingFields: [],
        suggestedNotes: [],
        aiSummary: "",
        aiRecommendation: "manual_review",
        confidenceScore: 0,
        riskLevel: "medium",
        status: "needs_review",
      });
    }
    for (const image of aprilImages) {
      pushItem({
        source: mapImageSource(image.kind),
        sourceRecordId: `april26-img-${image.relativePath.replace(/[^a-z0-9]+/gi, "-")}`,
        title: `${image.kind === "check" ? "Check" : image.kind === "in_kind" ? "In-kind" : "Receipt"} image`,
        subtitle: image.relativePath,
        fields: [
          {
            key: "reviewNote",
            label: "Review note",
            value: "",
            fieldType: "textarea",
            required: false,
            editable: true,
            source: "manual",
            confidence: "low",
            validationStatus: "ok",
          },
        ],
        evidence: imageEvidence(image.relativePath, image.kind),
        warnings: ["Run vision extract or enter fields manually."],
        blockers: [],
        missingFields: ["Amount", "Date"],
        suggestedNotes: ["Compare to Ethics workbook row and bank line."],
        aiSummary: "",
        aiRecommendation: "needs_info",
        confidenceScore: 0,
        riskLevel: "medium",
        status: "needs_review",
      });
    }
  }

  for (const movement of movements.filter((m) => m.approvalStatus !== "approved")) {
    pushItem(buildMoneyItem(movement));
  }

  for (const receipt of receipts.filter((r) => r.approvalStatus !== "approved")) {
    pushItem(buildReceiptItem(receipt));
  }

  for (const row of cash.filter((c) => c.approvalStatus !== "approved")) {
    pushItem(buildCashItem(row));
  }

  for (const vendor of vendors.filter((v) => v.w9Status === "missing" && v.likely1099Required)) {
    pushItem({
      source: "vendor_payment",
      sourceRecordId: vendor.id,
      title: `Vendor W-9 · ${vendor.name}`,
      amount: vendor.ytdPaid,
      entityName: vendor.name,
      fields: [field("w9Status", "W-9 status", vendor.w9Status, true, "select", ["missing", "requested", "received"])],
      evidence: [{ id: `vendor-${vendor.id}`, type: "audit_note", title: "Vendor record", textPreview: vendor.notes ?? "" }],
      warnings: ["1099 likely required"],
      blockers: [],
      missingFields: vendor.w9Status === "missing" ? ["W-9"] : [],
      suggestedNotes: ["Request W-9 before year-end."],
      aiSummary: "",
      aiRecommendation: "needs_info",
      confidenceScore: 0,
      riskLevel: "medium",
      status: "needs_review",
    });
  }

  for (const analysis of bank) {
    for (const txn of analysis.stagedTransactions.filter((t) => t.reconciliationStatus !== "matched" && t.reconciliationStatus !== "ignored")) {
      pushItem({
        source: "bank_transaction",
        sourceRecordId: txn.id,
        title: `Bank · ${txn.description?.slice(0, 40) ?? txn.id}`,
        amount: Math.abs(txn.amount ?? 0),
        date: txn.postedDate,
        fields: [
          field("amount", "Amount", txn.amount, true, "money"),
          field("description", "Description", txn.description ?? "", false, "text"),
          field("postedDate", "Date", txn.postedDate ?? "", true, "date"),
        ],
        evidence: [{ id: `bank-${txn.id}`, type: "bank_row", title: "Bank CSV row", textPreview: JSON.stringify(txn.raw ?? txn, null, 2).slice(0, 1500) }],
        warnings: txn.warnings ?? [],
        blockers: [],
        missingFields: [],
        suggestedNotes: ["Match to GoodChange payout or receipt."],
        aiSummary: "",
        aiRecommendation: "manual_review",
        confidenceScore: 0,
        riskLevel: "medium",
        status: "needs_review",
      });
    }
  }

  for (const match of matches.filter((m) => m.status !== "locked" && m.status !== "ignored")) {
    pushItem({
      source: "bank_transaction",
      sourceRecordId: match.id,
      title: `Reconciliation · ${match.matchType}`,
      amount: match.bankAmount ?? match.ledgerAmount,
      fields: [field("variance", "Variance", match.variance, false, "money")],
      evidence: [{ id: `match-${match.id}`, type: "bank_row", title: "Match record", textPreview: match.notes ?? "" }],
      warnings: match.variance ? [`Variance $${match.variance.toFixed(2)}`] : [],
      blockers: [],
      missingFields: [],
      suggestedNotes: ["Approve and lock when treasurer confirms."],
      aiSummary: "",
      aiRecommendation: "manual_review",
      confidenceScore: 0,
      riskLevel: "medium",
      status: "needs_review",
    });
  }

  for (const task of tasks.filter((t) => t.status === "open").slice(0, 50)) {
    pushItem({
      source: task.type === "rule_verification_required" ? "rule_review" : "filing_task",
      sourceRecordId: task.id,
      title: task.title,
      fields: [],
      evidence: [{ id: `task-${task.id}`, type: "audit_note", title: "Task", textPreview: task.notes.join("\n") }],
      warnings: [],
      blockers: task.priority === "urgent" ? ["Filing blocker"] : [],
      missingFields: [],
      suggestedNotes: [task.notes[0] ?? ""],
      aiSummary: "",
      aiRecommendation: "needs_info",
      confidenceScore: 0,
      riskLevel: task.priority === "urgent" ? "high" : "medium",
      status: "needs_review",
    });
  }

  for (const topic of ruleAudit.topicCoverage.filter((t) => !t.verified).slice(0, 20)) {
    pushItem({
      source: "rule_review",
      sourceRecordId: topic.topic,
      title: `Rule review · ${topic.label}`,
      fields: [],
      evidence: [{ id: `rule-${topic.topic}`, type: "rule_citation", title: topic.label, textPreview: topic.nextAction }],
      warnings: [topic.nextAction],
      blockers: [],
      missingFields: [],
      suggestedNotes: ["Compliance officer review required."],
      aiSummary: "",
      aiRecommendation: "needs_info",
      confidenceScore: 0,
      riskLevel: "medium",
      status: "needs_review",
    });
  }

  const queues: ApprovalQueue[] = [
    {
      id: APRIL_2026_QUEUE_ID,
      label: "April 2026 Compliance Review",
      description: "GoodChange, bank, receipts, cash/checks, vendors, and filing blockers from April26 imports.",
      filterTags: ["april-2026", "imports"],
      itemIds: draftItems.map((item) => item.id),
      createdAt: now,
      updatedAt: now,
    },
    ...buildVirtualQueues(draftItems, now),
  ];

  const mergedItems = [...preserved.values(), ...draftItems];
  return { queues, items: mergedItems };
}

function buildVirtualQueues(items: ApprovalItem[], now: string): ApprovalQueue[] {
  const defs: Array<{ id: string; label: string; description: string; filter: (item: ApprovalItem) => boolean; tags: string[] }> = [
    { id: "goodchange-contributions", label: "GoodChange Contributions", description: "Online contributions", filter: (i) => i.source === "goodchange_contribution", tags: ["goodchange"] },
    { id: "bank-transactions", label: "Bank Transactions", description: "Unmatched bank lines", filter: (i) => i.source === "bank_transaction", tags: ["bank"] },
    { id: "receipts-queue", label: "Receipts", description: "Receipt expenses", filter: (i) => i.source === "receipt_expense", tags: ["receipts"] },
    { id: "cash-checks", label: "Cash and Checks", description: "Cash, check, in-kind", filter: (i) => ["cash_contribution", "check_contribution", "in_kind_contribution"].includes(i.source), tags: ["cash", "checks"] },
    { id: "vendor-1099", label: "Vendor/1099", description: "Vendor and 1099 items", filter: (i) => i.source === "vendor_payment" || i.source === "staff_1099_payment", tags: ["vendor"] },
    { id: "filing-blockers", label: "Filing Blockers", description: "Tasks blocking filing", filter: (i) => i.source === "filing_task" || i.blockers.length > 0, tags: ["filing"] },
    { id: "high-risk-only", label: "High Risk Only", description: "High or blocked risk", filter: (i) => i.riskLevel === "high" || i.riskLevel === "blocked", tags: ["risk"] },
    { id: "ready-to-approve", label: "Ready to Approve", description: "Low risk, complete fields", filter: (i) => i.riskLevel === "low" && !i.missingFields.length && i.status === "needs_review", tags: ["ready"] },
    { id: "needs-info", label: "Needs Info", description: "Awaiting information", filter: (i) => i.status === "needs_info" || i.aiRecommendation === "needs_info", tags: ["needs-info"] },
  ];
  return defs.map((def) => ({
    id: def.id,
    label: def.label,
    description: def.description,
    filterTags: def.tags,
    itemIds: items.filter(def.filter).map((item) => item.id),
    createdAt: now,
    updatedAt: now,
  }));
}

function field(
  key: string,
  label: string,
  value: string | number | undefined,
  required: boolean,
  fieldType: ApprovalField["fieldType"],
  options?: string[],
): ApprovalField {
  const text = value == null ? "" : String(value);
  return {
    key,
    label,
    value: text,
    fieldType,
    required,
    editable: true,
    source: "imported",
    confidence: text ? "medium" : "low",
    validationStatus: required && !text.trim() ? "missing" : "ok",
    options,
  };
}

function buildGoodChangeItem(row: import("../imports/types").GoodChangeStagedContribution, fileName: string): Omit<ApprovalItem, "id" | "queueId" | "sortOrder" | "createdAt" | "updatedAt" | "auditTrailIds"> {
  return {
    source: "goodchange_contribution",
    sourceRecordId: row.id,
    title: `GoodChange · ${row.donorFullName ?? "Donor"}`,
    subtitle: fileName,
    amount: row.amount,
    date: row.transactionDate,
    entityName: row.donorFullName,
    fields: [
      field("donorFullName", "Donor", row.donorFullName, true, "text"),
      field("amount", "Amount", row.amount, true, "money"),
      field("employer", "Employer", row.employer, true, "text"),
      field("occupation", "Occupation", row.occupation, true, "text"),
      field("netAmount", "Net", row.netAmount, true, "money"),
    ],
    evidence: [{ id: `gc-${row.id}`, type: "goodchange_row", title: "Staged GoodChange row", textPreview: JSON.stringify(row.raw ?? {}, null, 2).slice(0, 2000) }],
    warnings: row.warnings,
    blockers: [],
    missingFields: row.missingFields,
    suggestedNotes: [],
    aiSummary: "",
    aiRecommendation: "manual_review",
    confidenceScore: 0,
    riskLevel: "medium",
    status: row.missingFields.length ? "needs_review" : "ready",
  };
}

function buildMoneyItem(movement: import("../money/money-movement-types").StagedMoneyMovement) {
  return {
    source: "manual_money_movement" as const,
    sourceRecordId: movement.id,
    title: `${movement.category} · ${movement.name ?? movement.id}`,
    amount: movement.amount,
    date: movement.transactionDate,
    entityName: movement.name,
    fields: [
      field("amount", "Amount", movement.amount, true, "money"),
      field("name", "Name", movement.name, true, "text"),
      field("employer", "Employer", movement.employer, false, "text"),
      field("purpose", "Purpose", movement.purpose, false, "textarea"),
    ],
    evidence: movement.sourceRefs.map((ref, index) => ({ id: `ref-${index}`, type: "audit_note" as const, title: ref })),
    warnings: movement.warnings,
    blockers: [],
    missingFields: movement.missingFields,
    suggestedNotes: [],
    aiSummary: "",
    aiRecommendation: "manual_review" as const,
    confidenceScore: 0,
    riskLevel: "medium" as const,
    status: "needs_review" as const,
  };
}

function buildReceiptItem(receipt: import("../receipts/receipt-types").StagedReceiptExpense) {
  return {
    source: "receipt_expense" as const,
    sourceRecordId: receipt.id,
    title: `Receipt · ${receipt.vendorName ?? "Vendor"}`,
    amount: receipt.total,
    date: receipt.receiptDate,
    entityName: receipt.vendorName,
    fields: [
      field("vendorName", "Vendor", receipt.vendorName, true, "text"),
      field("total", "Total", receipt.total, true, "money"),
      field("tip", "Tip", receipt.tip, false, "money"),
      field("receiptDate", "Date", receipt.receiptDate, true, "date"),
      field("category", "Category", receipt.category, true, "select"),
      field("businessPurpose", "Purpose", receipt.businessPurpose, true, "textarea"),
    ],
    evidence: [
      ...(receipt.imagePath ? [{ id: "img", type: "receipt_image" as const, title: receipt.sourceFileName ?? "Receipt image", path: receipt.imagePath }] : []),
      ...(receipt.extraction ? [{ id: "ocr", type: "ocr_text" as const, title: "OCR extraction", textPreview: JSON.stringify(receipt.extraction, null, 2).slice(0, 2000) }] : []),
    ],
    warnings: receipt.warnings,
    blockers: receipt.documentationStatus === "missing_receipt" ? ["Evidence missing"] : [],
    missingFields: receipt.extraction?.missingFields ?? [],
    suggestedNotes: [],
    aiSummary: "",
    aiRecommendation: "manual_review" as const,
    confidenceScore: 0,
    riskLevel: "medium" as const,
    status: "needs_review" as const,
  };
}

function buildCashItem(row: import("../cash/types").StagedCashContribution) {
  return {
    source: "cash_contribution" as const,
    sourceRecordId: row.id,
    title: `Cash · ${row.donorFullName ?? "Donor"}`,
    amount: row.amount,
    date: row.contributionDate,
    entityName: row.donorFullName,
    fields: [
      field("donorFullName", "Donor", row.donorFullName, true, "text"),
      field("amount", "Amount", row.amount, true, "money"),
      field("employer", "Employer", row.employer, true, "text"),
      field("occupation", "Occupation", row.occupation, true, "text"),
    ],
    evidence: [
      ...(row.donorSlipPhotoPath ? [{ id: "slip", type: "cash_slip" as const, title: "Donor slip", path: row.donorSlipPhotoPath }] : []),
      ...(row.billPhotoPath ? [{ id: "bill", type: "bill_photo" as const, title: "Bill photo", path: row.billPhotoPath }] : []),
    ],
    warnings: row.warnings,
    blockers: row.complianceStatus === "amount_over_cash_limit" ? ["Over cash threshold"] : [],
    missingFields: [],
    suggestedNotes: [],
    aiSummary: "",
    aiRecommendation: "manual_review" as const,
    confidenceScore: 0,
    riskLevel: (row.complianceStatus === "amount_over_cash_limit" ? "high" : "medium") as ApprovalItem["riskLevel"],
    status: "needs_review" as const,
  };
}

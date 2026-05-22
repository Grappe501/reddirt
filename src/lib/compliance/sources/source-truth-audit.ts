import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getApril26Dir } from "../approval/april26-source";
import { loadApprovalItems } from "../approval/approval-storage";
import { APRIL_2026_QUEUE_ID } from "../approval/build-approval-queue";
import { resolveBankSource } from "../april26/bank-source-adapter";
import { buildApril26ImportStatus } from "../imports/april26-import-status";
import { loadGoodChangeAnalyses } from "../storage";
import { loadReconciliationMatches } from "../reconciliation/reconciliation-workbench-storage";

export type SourceTruthEntry = {
  category: string;
  found: boolean;
  count: number;
  sourceLocation: string;
  normalizedType: string;
  confidenceUsable: "high" | "medium" | "low" | "none";
  dateCoverage: { earliest: string | null; latest: string | null };
  amountCoverage: { totalCredits: number; totalDebits: number } | null;
  missingFields: string[];
  privacySensitivity: "none" | "financial" | "donor_pii" | "mixed";
  satisfiesBankCsvRequirement: boolean;
  notes: string[];
};

export type SourceTruthAuditReport = {
  generatedAt: string;
  summary: {
    bankUsable: boolean;
    bankReconciliationStatus: string;
    orphanChunkCount: number;
    duplicateChunkCount: number;
    unmappedEvidenceCount: number;
  };
  entries: SourceTruthEntry[];
  operatorSummary: string;
};

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function countJsonFiles(dir: string): Promise<number> {
  if (!(await exists(dir))) return 0;
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith(".json") && !e.name.startsWith(".")).length;
}

async function readAnalysisAggregate(name: string): Promise<{ found: boolean; batchCount: number; status?: string }> {
  const p = path.join(process.cwd(), "data", "compliance", "analysis", name);
  try {
    const raw = JSON.parse(await readFile(p, "utf8")) as { batches?: unknown[]; status?: string };
    return { found: true, batchCount: raw.batches?.length ?? 0, status: raw.status };
  } catch {
    return { found: false, batchCount: 0 };
  }
}

export async function buildSourceTruthAudit(): Promise<SourceTruthAuditReport> {
  const entries: SourceTruthEntry[] = [];
  const bank = await resolveBankSource();
  const april26 = await buildApril26ImportStatus();
  const gcAnalyses = await loadGoodChangeAnalyses();
  const items = await loadApprovalItems();
  const aprilItems = items.filter((i) => i.queueId === APRIL_2026_QUEUE_ID);
  const matches = await loadReconciliationMatches();

  entries.push({
    category: "bank_statement_chunks",
    found: bank.databaseBatchCount > 0,
    count: bank.databaseTransactionCount,
    sourceLocation: "data/compliance/imports/bank/*.analysis.json",
    normalizedType: "bank_transaction",
    confidenceUsable: bank.canSatisfyBankRequirement && bank.primarySource.includes("database") ? "high" : bank.databaseTransactionCount > 0 ? "medium" : "none",
    dateCoverage: bank.dateCoverage,
    amountCoverage: bank.validTransactionCount
      ? { totalCredits: bank.creditTransactionCount, totalDebits: 0 }
      : null,
    missingFields: bank.missingFields,
    privacySensitivity: "financial",
    satisfiesBankCsvRequirement: bank.canSatisfyBankRequirement && bank.primarySource !== "none",
    notes: bank.databaseBatchCount ? [`${bank.databaseBatchCount} staged batch(es)`] : ["No bank import analysis files on disk"],
  });

  entries.push({
    category: "bank_csv_file",
    found: bank.fileFound,
    count: bank.fileRowCount,
    sourceLocation: bank.expectedFilePath,
    normalizedType: "bank_csv",
    confidenceUsable: bank.fileFound && bank.validTransactionCount > 0 ? "high" : bank.fileFound ? "low" : "none",
    dateCoverage: bank.dateCoverage,
    amountCoverage: bank.fileRowCount ? { totalCredits: bank.creditTransactionCount, totalDebits: 0 } : null,
    missingFields: bank.fileFound ? bank.missingFields : ["file"],
    privacySensitivity: "financial",
    satisfiesBankCsvRequirement: bank.primarySource === "file" || bank.primarySource === "file_and_database",
    notes: bank.fileFound ? ["April26 CSV path present"] : ["Expected bank-april-2026.csv not found; database chunks may still satisfy requirement"],
  });

  const gcDir = path.join(process.cwd(), "data", "compliance", "imports", "goodchange");
  entries.push({
    category: "goodchange_rows",
    found: april26.goodChangeCsvFound || gcAnalyses.length > 0,
    count: april26.goodChangeRows + gcAnalyses.reduce((s, a) => s + a.stagedContributions.length, 0),
    sourceLocation: april26.goodChangeCsvFound ? "Compliance/April26 GoodChange CSV" : gcDir,
    normalizedType: "contribution",
    confidenceUsable: april26.goodChangeRows > 0 ? "high" : gcAnalyses.length ? "medium" : "none",
    dateCoverage: { earliest: null, latest: null },
    amountCoverage: null,
    missingFields: [],
    privacySensitivity: "donor_pii",
    satisfiesBankCsvRequirement: false,
    notes: ["Payout source for reconciliation — not a substitute for bank credits"],
  });

  const bankAgg = await readAnalysisAggregate("bank-import-analysis.json");
  entries.push({
    category: "bank_import_aggregate",
    found: bankAgg.found,
    count: bankAgg.batchCount,
    sourceLocation: "data/compliance/analysis/bank-import-analysis.json",
    normalizedType: "analysis_snapshot",
    confidenceUsable: bankAgg.batchCount > 0 ? "medium" : "low",
    dateCoverage: { earliest: null, latest: null },
    amountCoverage: null,
    missingFields: bankAgg.batchCount === 0 ? ["batches"] : [],
    privacySensitivity: "financial",
    satisfiesBankCsvRequirement: false,
    notes: [
      ...(bankAgg.status ? [`status: ${bankAgg.status}`] : []),
      ...(bankAgg.batchCount > 0 ? [`${bank.databaseTransactionCount} staged txn(s) loaded from aggregate`] : []),
    ],
  });

  const receiptsDir = path.join(process.cwd(), "data", "compliance", "receipts");
  const receiptCount = await countJsonFiles(receiptsDir);
  entries.push({
    category: "receipts_staged",
    found: receiptCount > 0 || april26.receiptImagesFound > 0,
    count: receiptCount + april26.receiptImagesFound,
    sourceLocation: `${receiptsDir} + April26 images`,
    normalizedType: "receipt_expense",
    confidenceUsable: receiptCount > 0 ? "medium" : april26.receiptImagesFound ? "low" : "none",
    dateCoverage: { earliest: null, latest: null },
    amountCoverage: null,
    missingFields: [],
    privacySensitivity: "mixed",
    satisfiesBankCsvRequirement: false,
    notes: [],
  });

  entries.push({
    category: "check_images",
    found: april26.checkImagesFound > 0,
    count: april26.checkImagesFound,
    sourceLocation: "Compliance/April26 check images",
    normalizedType: "check_contribution",
    confidenceUsable: april26.checkImagesFound > 0 ? "medium" : "none",
    dateCoverage: { earliest: null, latest: null },
    amountCoverage: null,
    missingFields: [],
    privacySensitivity: "donor_pii",
    satisfiesBankCsvRequirement: false,
    notes: [],
  });

  entries.push({
    category: "payout_batches",
    found: april26.payoutBatches > 0,
    count: april26.payoutBatches,
    sourceLocation: "GoodChange CSV payout_id grouping",
    normalizedType: "payout_batch",
    confidenceUsable: april26.payoutBatches > 0 ? "high" : "none",
    dateCoverage: { earliest: null, latest: null },
    amountCoverage: null,
    missingFields: [],
    privacySensitivity: "financial",
    satisfiesBankCsvRequirement: false,
    notes: [],
  });

  const bankTxnItems = aprilItems.filter((i) => i.source === "bank_transaction");
  entries.push({
    category: "approval_bank_transactions",
    found: bankTxnItems.length > 0,
    count: bankTxnItems.length,
    sourceLocation: "approval-items.json",
    normalizedType: "approval_queue",
    confidenceUsable: bankTxnItems.length > 0 ? "medium" : "none",
    dateCoverage: { earliest: null, latest: null },
    amountCoverage: null,
    missingFields: [],
    privacySensitivity: "financial",
    satisfiesBankCsvRequirement: false,
    notes: [],
  });

  const sourcePending = aprilItems.filter((i) => i.status === "needs_info" && /source/i.test(i.title ?? ""));
  entries.push({
    category: "source_update_pending",
    found: sourcePending.length > 0,
    count: sourcePending.length,
    sourceLocation: "approval queue",
    normalizedType: "source_update_pending",
    confidenceUsable: sourcePending.length ? "low" : "none",
    dateCoverage: { earliest: null, latest: null },
    amountCoverage: null,
    missingFields: [],
    privacySensitivity: "mixed",
    satisfiesBankCsvRequirement: false,
    notes: ["Requires human source evidence"],
  });

  entries.push({
    category: "reconciliation_matches",
    found: matches.length > 0,
    count: matches.length,
    sourceLocation: "data/compliance/reconciliation/matches.json",
    normalizedType: "reconciliation_match",
    confidenceUsable: matches.some((m) => m.status === "locked") ? "high" : matches.length ? "medium" : "none",
    dateCoverage: { earliest: null, latest: null },
    amountCoverage: null,
    missingFields: [],
    privacySensitivity: "financial",
    satisfiesBankCsvRequirement: false,
    notes: [],
  });

  const ethicsPaths = ["ethics-workbook.xlsx", "Ethics Workbook.xlsx", "April 2026 Ethics Filing.xlsx"];
  let ethicsFound = false;
  const aprilDir = getApril26Dir();
  for (const name of ethicsPaths) {
    if (await exists(path.join(aprilDir, name))) ethicsFound = true;
  }
  entries.push({
    category: "ethics_workbook",
    found: ethicsFound || april26.ethicsWorkbookFound,
    count: ethicsFound ? 1 : 0,
    sourceLocation: "Compliance/April26",
    normalizedType: "ethics_workbook",
    confidenceUsable: ethicsFound ? "medium" : "none",
    dateCoverage: { earliest: null, latest: null },
    amountCoverage: null,
    missingFields: [],
    privacySensitivity: "mixed",
    satisfiesBankCsvRequirement: false,
    notes: [],
  });

  const tasksDir = path.join(process.cwd(), "data", "compliance", "tasks");
  const taskCount = await countJsonFiles(tasksDir);
  entries.push({
    category: "filing_tasks",
    found: taskCount > 0,
    count: taskCount,
    sourceLocation: "data/compliance/tasks (private, not committed)",
    normalizedType: "filing_task",
    confidenceUsable: taskCount > 0 ? "medium" : "none",
    dateCoverage: { earliest: null, latest: null },
    amountCoverage: null,
    missingFields: [],
    privacySensitivity: "mixed",
    satisfiesBankCsvRequirement: false,
    notes: ["Count only — no task body in audit output"],
  });

  const orphanChunks = bank.databaseBatchCount > 0 && bank.validTransactionCount === 0 ? bank.databaseTransactionCount : 0;
  const duplicateChunks = 0;

  let operatorSummary: string;
  if (bank.canSatisfyBankRequirement) {
    operatorSummary = `Usable bank source from ${bank.primarySource}. ${bank.validTransactionCount} credit row(s). Reconciliation may proceed.`;
  } else if (bank.databaseTransactionCount > 0) {
    operatorSummary =
      "Bank data found in imported chunks but not yet valid for reconciliation. Fix dates/amounts or add CSV to verify.";
  } else if (bank.fileFound) {
    operatorSummary = "Bank file exists but cannot reconcile because validation failed.";
  } else {
    operatorSummary = "No usable bank data found. Add bank-april-2026.csv or import via admin bank import.";
  }

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      bankUsable: bank.canSatisfyBankRequirement,
      bankReconciliationStatus: bank.reconciliationStatus,
      orphanChunkCount: orphanChunks,
      duplicateChunkCount: duplicateChunks,
      unmappedEvidenceCount: april26.receiptImagesFound + april26.checkImagesFound,
    },
    entries,
    operatorSummary,
  };
}

export async function writeSourceTruthAudit(outputPath?: string): Promise<SourceTruthAuditReport> {
  const report = await buildSourceTruthAudit();
  const out = outputPath ?? path.join(process.cwd(), "data", "compliance", "ai", "source-truth-audit.json");
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}

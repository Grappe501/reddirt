import { access, readdir } from "node:fs/promises";
import path from "node:path";
import { getApril26Dir, loadApril26GoodChangeRows, listApril26ImageFiles } from "../approval/april26-source";
import { loadApprovalItems } from "../approval/approval-storage";
import { loadReconciliationMatches } from "../reconciliation/reconciliation-workbench-storage";
import { APRIL_2026_QUEUE_ID } from "../approval/build-approval-queue";

export type April26ImportStatus = {
  folderPath: string;
  folderExists: boolean;
  goodChangeCsvFound: boolean;
  ethicsWorkbookFound: boolean;
  bankCsvFound: boolean;
  bankCsvExpectedPath: string;
  receiptImagesFound: number;
  inKindPagesFound: number;
  checkImagesFound: number;
  goodChangeRows: number;
  stagedContributions: number;
  stagedExpenses: number;
  receiptDocuments: number;
  checkDocuments: number;
  inKindDocuments: number;
  payoutBatches: number;
  approvalQueueItems: number;
  reconciliationBlockers: number;
  stagedNeedingApproval: number;
  stagedNeedingReconciliation: number;
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findBankCsv(dir: string): Promise<{ found: boolean; path: string }> {
  const expected = path.join(dir, "bank-april-2026.csv");
  if (await fileExists(expected)) return { found: true, path: expected };
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const match = entries.find((entry) => entry.isFile() && /\.csv$/i.test(entry.name) && /bank|statement|checking/i.test(entry.name));
    if (match) return { found: true, path: path.join(dir, match.name) };
  } catch {
    /* ignore */
  }
  return { found: false, path: expected };
}

function countPayoutBatches(rows: Record<string, string>[]): number {
  const ids = new Set(rows.map((row) => row.payout_id || row.transfer_id).filter(Boolean));
  return ids.size;
}

export async function buildApril26ImportStatus(): Promise<April26ImportStatus> {
  const folderPath = getApril26Dir();
  const folderExists = await fileExists(folderPath);
  const goodChangeCsvName = "_Committee to Elect Kelly Grappe_transactions_Apr 1, 2026_Apr 30, 2026_.csv";
  const goodChangeCsvFound = folderExists && (await fileExists(path.join(folderPath, goodChangeCsvName)));
  const ethicsWorkbookFound =
    folderExists &&
    ((await fileExists(path.join(folderPath, "ethics-workbook.xlsx"))) ||
      (await fileExists(path.join(folderPath, "Ethics Workbook.xlsx"))));
  const bank = folderExists ? await findBankCsv(folderPath) : { found: false, path: path.join(folderPath, "bank-april-2026.csv") };
  let images: Awaited<ReturnType<typeof listApril26ImageFiles>> = [];
  let goodChangeRows: Record<string, string>[] = [];
  if (folderExists) {
    images = await listApril26ImageFiles().catch(() => []);
    goodChangeRows = goodChangeCsvFound ? await loadApril26GoodChangeRows().catch(() => []) : [];
  }
  const receiptImagesFound = images.filter((image) => image.kind === "receipt").length;
  const inKindPagesFound = images.filter((image) => image.kind === "in_kind").length;
  const checkImagesFound = images.filter((image) => image.kind === "check").length;
  const items = await loadApprovalItems();
  const aprilItems = items.filter((item) => item.queueId === APRIL_2026_QUEUE_ID);
  const matches = await loadReconciliationMatches();
  const stagedNeedingApproval = aprilItems.filter((item) =>
    ["queued", "needs_review", "ready", "reopened"].includes(item.status),
  ).length;
  const stagedNeedingReconciliation = matches.filter((match) => match.status !== "locked" && match.status !== "ignored").length;
  const reconciliationBlockers = !bank.found ? 1 + stagedNeedingReconciliation : stagedNeedingReconciliation;
  const stagedContributions = aprilItems.filter((item) =>
    ["goodchange_contribution", "check_contribution", "in_kind_contribution", "cash_contribution"].includes(item.source),
  ).length;
  const stagedExpenses = aprilItems.filter((item) => item.source === "receipt_expense").length;

  return {
    folderPath,
    folderExists,
    goodChangeCsvFound,
    ethicsWorkbookFound: Boolean(ethicsWorkbookFound),
    bankCsvFound: bank.found,
    bankCsvExpectedPath: bank.path,
    receiptImagesFound,
    inKindPagesFound,
    checkImagesFound,
    goodChangeRows: goodChangeRows.length,
    stagedContributions,
    stagedExpenses,
    receiptDocuments: receiptImagesFound,
    checkDocuments: checkImagesFound,
    inKindDocuments: inKindPagesFound,
    payoutBatches: countPayoutBatches(goodChangeRows),
    approvalQueueItems: aprilItems.length,
    reconciliationBlockers,
    stagedNeedingApproval,
    stagedNeedingReconciliation,
  };
}

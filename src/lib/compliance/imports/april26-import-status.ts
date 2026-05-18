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
  bankCsvFound: boolean;
  receiptImagesFound: number;
  inKindPagesFound: number;
  checkImagesFound: number;
  goodChangeRows: number;
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

async function findBankCsv(dir: string): Promise<boolean> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.some((entry) => entry.isFile() && /\.csv$/i.test(entry.name) && /bank|statement|checking/i.test(entry.name));
  } catch {
    return false;
  }
}

export async function buildApril26ImportStatus(): Promise<April26ImportStatus> {
  const folderPath = getApril26Dir();
  const folderExists = await fileExists(folderPath);
  const goodChangeCsvName = "_Committee to Elect Kelly Grappe_transactions_Apr 1, 2026_Apr 30, 2026_.csv";
  const goodChangeCsvFound = folderExists && (await fileExists(path.join(folderPath, goodChangeCsvName)));
  const bankCsvFound = folderExists && (await findBankCsv(folderPath));
  let images: Awaited<ReturnType<typeof listApril26ImageFiles>> = [];
  let goodChangeRows = 0;
  if (folderExists) {
    images = await listApril26ImageFiles().catch(() => []);
    goodChangeRows = goodChangeCsvFound ? (await loadApril26GoodChangeRows().catch(() => [])).length : 0;
  }
  const receiptImagesFound = images.filter((image) => image.kind === "receipt").length;
  const inKindPagesFound = images.filter((image) => image.kind === "in_kind").length;
  const checkImagesFound = images.filter((image) => image.kind === "check").length;
  const items = await loadApprovalItems();
  const aprilItems = items.filter((item) => item.queueId === APRIL_2026_QUEUE_ID);
  const stagedNeedingApproval = aprilItems.filter((item) =>
    ["queued", "needs_review", "ready", "reopened"].includes(item.status),
  ).length;
  const matches = await loadReconciliationMatches();
  const stagedNeedingReconciliation = matches.filter((match) => match.status !== "locked" && match.status !== "ignored").length;

  return {
    folderPath,
    folderExists,
    goodChangeCsvFound,
    bankCsvFound,
    receiptImagesFound,
    inKindPagesFound,
    checkImagesFound,
    goodChangeRows,
    stagedNeedingApproval,
    stagedNeedingReconciliation,
  };
}

import { loadApprovalItems } from "../../src/lib/compliance/approval/approval-storage";
import { APRIL_2026_QUEUE_ID } from "../../src/lib/compliance/approval/build-approval-queue";
import { discoverApril26Sources } from "../../src/lib/compliance/april26/discover-april26-sources";
import { loadApril26IngestSummary } from "../../src/lib/compliance/april26/april26-ingest-storage";
import { ETHICS_XLSX_NAME, GOODCHANGE_CSV_NAME } from "../../src/lib/compliance/april26/paths";

const EXPECTED_SHEETS = ["Good Change", "ChesksCash Donations", "In Kind Donations", "Expenditures"];

async function main() {
  const failures: string[] = [];
  const inventory = await discoverApril26Sources();

  if (!inventory.folderExists) failures.push("April26 folder missing");
  if (!inventory.goodChangeCsvFound) failures.push(`GoodChange CSV missing (${GOODCHANGE_CSV_NAME})`);
  if (!inventory.ethicsWorkbookFound) failures.push(`Ethics workbook missing (${ETHICS_XLSX_NAME})`);

  for (const sheet of EXPECTED_SHEETS) {
    if (inventory.ethicsWorkbookFound && !inventory.sheetsFound.some((name) => name.includes(sheet.split(" ")[0]))) {
      if (!inventory.sheetsFound.includes(sheet) && sheet !== "Good Change") {
        failures.push(`Expected workbook sheet not found: ${sheet}`);
      }
    }
  }

  if (inventory.checkImageCount < 1) failures.push("No check images found");
  if (inventory.receiptImageCount < 1) failures.push("No receipt images found");
  if (inventory.inKindImageCount < 1) failures.push("No in-kind images found");

  const summary = await loadApril26IngestSummary();
  if (!summary) {
    failures.push("No ingest summary — run npm run compliance:april26:dry or :ingest first");
  } else {
    const requiredKeys = [
      "goodChangeRows",
      "contributionsStaged",
      "expensesStaged",
      "aiChunkCount",
      "payoutBatchCount",
    ] as const;
    for (const key of requiredKeys) {
      if (typeof summary[key] !== "number") failures.push(`Ingest summary missing field: ${key}`);
    }
    if (summary.goodChangeRows < 1) failures.push("GoodChange row count is zero");
  }

  if (!inventory.bankCsvFound) {
    console.warn("[qa-april26] bank CSV missing — expected reconciliation blocker (not a failure).");
  }

  const approvalItems = await loadApprovalItems().catch(() => []);
  const aprilCount = approvalItems.filter((item) => item.queueId === APRIL_2026_QUEUE_ID).length;
  if (aprilCount < 1) {
    failures.push("April 2026 approval queue empty — run npm run compliance:approval:build after ingest");
  }

  const result = {
    status: failures.length ? "fail" : "ok",
    inventory: {
      sourceDir: inventory.sourceDir,
      goodChangeCsv: inventory.goodChangeCsvFound,
      ethicsWorkbook: inventory.ethicsWorkbookFound,
      bankCsv: inventory.bankCsvFound,
      checkImages: inventory.checkImageCount,
      receiptImages: inventory.receiptImageCount,
      inKindImages: inventory.inKindImageCount,
      sheets: inventory.sheetsFound,
    },
    ingestSummary: summary,
    approvalQueueItems: aprilCount,
    failures,
  };

  console.log(JSON.stringify(result, null, 2));
  if (failures.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

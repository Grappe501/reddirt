import { buildApril26ImportStatus } from "../../src/lib/compliance/imports/april26-import-status";
import { buildApprovalQueues } from "../../src/lib/compliance/approval/build-approval-queue";

async function main() {
  const [april26, queues] = await Promise.all([buildApril26ImportStatus(), buildApprovalQueues()]);
  if (!april26.folderExists) throw new Error("April26 folder missing");
  if (!april26.goodChangeCsvFound) throw new Error("GoodChange CSV missing");
  if (!queues.items.length) throw new Error("Approval queue build returned no items");
  console.log(
    JSON.stringify(
      {
        status: "ok",
        goodChangeRows: april26.goodChangeRows,
        approvalItems: queues.items.length,
        bankCsvFound: april26.bankCsvFound,
        reconciliationBlockers: april26.reconciliationBlockers,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

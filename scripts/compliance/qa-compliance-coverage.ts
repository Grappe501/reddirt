import { auditComplianceRuleCorpus } from "../../src/lib/compliance/knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "../../src/lib/compliance/knowledge/load-compliance-rule-corpus";
import { loadStagedMoneyMovements } from "../../src/lib/compliance/money/money-movement-storage";
import { loadStagedReceipts } from "../../src/lib/compliance/receipts/receipt-storage";

async function main() {
  const [corpus, receipts, movements] = await Promise.all([
    loadComplianceRuleCorpus(),
    loadStagedReceipts(),
    loadStagedMoneyMovements(),
  ]);
  const audit = auditComplianceRuleCorpus(corpus);
  const receiptMovements = movements.filter((movement) => movement.source === "receipt_intake");
  const uploadedImageCommittedRisk = receipts.some((receipt) => receipt.imagePath && !receipt.imagePath.startsWith("data/compliance/receipts/uploads/"));
  if (!corpus || !audit.chunksIndexed) throw new Error("Rule corpus missing.");
  if (uploadedImageCommittedRisk) throw new Error("Receipt upload path is outside ignored upload directory.");
  console.log(JSON.stringify({
    ruleChunks: audit.chunksIndexed,
    topicsMissing: audit.topicsMissing,
    receipts: receipts.length,
    receiptMoneyMovements: receiptMovements.length,
    warning: audit.warning,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

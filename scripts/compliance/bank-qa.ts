import { buildBankReconciliationRehearsal } from "../../src/lib/compliance/imports/bank-reconciliation-rehearsal";
import { buildBankCsvOperatorGuide } from "../../src/lib/compliance/imports/bank-csv-operator-state";

async function main() {
  const rehearsal = await buildBankReconciliationRehearsal();
  const guide = buildBankCsvOperatorGuide(rehearsal.bankReadiness, {
    unmatchedBank: rehearsal.unmatchedBank.length,
    ambiguous: rehearsal.ambiguous.length,
    highConfidence: rehearsal.highConfidence.length,
  });
  const br = rehearsal.bankReadiness;
  const result = {
    status: br.canSatisfyBankRequirement ? "reconciliation_ready" : br.databaseTransactionCount > 0 ? "database_source_available" : br.found ? "file_source_available" : "missing_file_only",
    sourceStatus: rehearsal.sourceStatus,
    primarySource: rehearsal.primarySource,
    canSatisfyBankRequirement: br.canSatisfyBankRequirement,
    databaseTransactionCount: br.databaseTransactionCount,
    operatorState: guide.state,
    operatorStateSourceType: guide.sourceType,
    operatorHeadline: guide.headline,
    operatorSummary: br.operatorSummary,
    readyForRehearsal: rehearsal.readyForRehearsal,
    creditRows: rehearsal.creditRows,
    highConfidenceMatches: rehearsal.highConfidence.length,
    ambiguousMatches: rehearsal.ambiguous.length,
    unmatchedBank: rehearsal.unmatchedBank.length,
    unmatchedPayouts: rehearsal.unmatchedPayouts.length,
    parseIssueCount: rehearsal.parseIssues.length,
    operatorNextSteps: rehearsal.operatorNextSteps,
  };
  console.log(JSON.stringify(result, null, 2));
  if (!br.canSatisfyBankRequirement && !br.databaseTransactionCount) process.exit(0);
  if (rehearsal.parseIssues.some((i) => i.code === "header_mismatch")) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { buildBankReconciliationRehearsal } from "../../src/lib/compliance/imports/bank-reconciliation-rehearsal";
import { buildBankCsvOperatorGuide } from "../../src/lib/compliance/imports/bank-csv-operator-state";

async function main() {
  const rehearsal = await buildBankReconciliationRehearsal();
  const guide = buildBankCsvOperatorGuide(rehearsal.bankReadiness, {
    unmatchedBank: rehearsal.unmatchedBank.length,
    ambiguous: rehearsal.ambiguous.length,
    highConfidence: rehearsal.highConfidence.length,
  });
  const result = {
    status: rehearsal.bankReadiness.found ? "ok" : "missing_file",
    operatorState: guide.state,
    operatorHeadline: guide.headline,
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
  if (!rehearsal.bankReadiness.found) process.exit(0);
  if (rehearsal.parseIssues.some((i) => i.code === "header_mismatch")) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

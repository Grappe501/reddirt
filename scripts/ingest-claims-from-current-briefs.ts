/**
 * Ingest claims from all current governed briefs into claim ledger.
 */
import { ingestAllCurrentBriefClaims } from "../src/lib/intelligence/claims/claimLedgerIngest";
import { summarizeClaimLedger } from "../src/lib/intelligence/claims/claimLedgerSummary";

function main() {
  const result = ingestAllCurrentBriefClaims();
  const summary = summarizeClaimLedger();

  console.log("Claim ledger ingest complete");
  console.log("  ingested:", result.totalIngested);
  console.log("  merged:", result.totalMerged);
  console.log("  by domain:", result.byDomain);
  console.log("  ledger total:", summary.totalClaims);
  console.log(
    "  verified/inferred/unsupported:",
    summary.verifiedClaims,
    summary.inferredClaims,
    summary.unsupportedClaims,
  );
}

main();

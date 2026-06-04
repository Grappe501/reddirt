/**
 * P2 debate claims gate — ledger debate domain, internal approvals, do-not-say rejects.
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDebateIntelligenceV4Packet } from "../src/lib/intelligence/v4/debateIntelligenceV4";
import { listDebateWeekClaims } from "../src/lib/intelligence/claims/debateClaimsSeed";
import { summarizeClaimLedger } from "../src/lib/intelligence/claims/claimLedgerSummary";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const v4 = loadDebateIntelligenceV4Packet();
  const summary = summarizeClaimLedger();
  const debate = listDebateWeekClaims();

  const internalApproved = debate.filter((c) => c.verificationStatus === "HUMAN_APPROVED_INTERNAL");
  const doNotSay = debate.filter((c) => c.internalUseStatus === "DO_NOT_USE" || c.verificationStatus === "REJECTED");
  const withAnchors = debate.filter((c) => c.citationAnchorIds.length > 0);
  const supportedMarkdown = v4.hub.claims.supported.length;

  console.log("Debate intelligence P2 (claims)");
  console.log("  ledger total:", summary.totalClaims);
  console.log("  debate-week claims:", debate.length);
  console.log("  internal-approved (debate):", internalApproved.length);
  console.log("  do-not-say / rejected (debate):", doNotSay.length);
  console.log("  debate claims with anchors:", withAnchors.length);
  console.log("  v4 markdown supported:", supportedMarkdown);
  console.log("  approved internal (all):", summary.approvedInternal);

  const ok =
    debate.length >= 12 &&
    internalApproved.length >= 4 &&
    doNotSay.length >= 3 &&
    withAnchors.length >= 4 &&
    summary.approvedInternal >= 5;

  if (!ok) {
    console.error("FAIL — P2 debate claims gate (run: npx tsx scripts/seed-debate-week-claims.ts)");
    process.exit(1);
  }
  console.log("OK — P2 debate claims workflow");
}

main();

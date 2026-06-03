/**
 * Debate week readiness — opposition JSON, daily packet, and nav wiring.
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadKimHammerWorkbench } from "../src/lib/opposition/kimHammerWorkbench";
import { runDailyIntelligenceAgentPass } from "../src/lib/intelligence/intelligenceAgentOrchestrator";
import { loadOppositionArchiveRollup } from "../src/lib/opposition/oppositionBriefConfidence";
import { summarizeClaimLedger } from "../src/lib/intelligence/claims/claimLedgerSummary";
import { summarizeHumanActionQueue } from "../src/lib/intelligence/strategicDecisionSupport";
import { DEBATE_WEEK_NAV_ITEMS } from "../src/lib/intelligence/debate-week-nav";
import { buildCampaignOsNavGroups } from "../src/lib/dashboard-orchestration/campaign-os-nav-config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const workbench = loadKimHammerWorkbench();
  const packet = runDailyIntelligenceAgentPass({ syncActionQueue: false });
  const archive = loadOppositionArchiveRollup();
  const claims = summarizeClaimLedger();
  const actions = summarizeHumanActionQueue();
  const intelGroup = buildCampaignOsNavGroups("2026-03").find((g) => g.id === "intelligence");

  console.log("Debate week readiness");
  console.log("  bills indexed:", workbench.totalBills);
  console.log("  debate drill cards:", workbench.debateDrillQueue.length);
  console.log("  research confidence:", workbench.researchConfidenceScore);
  console.log("  daily priorities:", packet.topPriorities.length);
  console.log("  debate readiness overall:", packet.debateReadinessOverall);
  console.log("  retrieval tasks:", `${archive.retrievalTasksComplete}/${archive.retrievalTasksTotal}`);
  console.log("  direct clips:", archive.directClipCount);
  console.log("  claims total / needs review:", claims.totalClaims, claims.needsReviewClaims);
  console.log("  open actions / urgent:", actions.totalActions, actions.urgentCount);
  console.log("  sidebar intelligence links:", intelGroup?.links.length ?? 0);
  console.log("  debate subnav items:", DEBATE_WEEK_NAV_ITEMS.length);

  const ok =
    workbench.totalBills >= 18 &&
    workbench.debateDrillQueue.length >= 1 &&
    packet.topPriorities.length >= 3 &&
    intelGroup?.links.length === DEBATE_WEEK_NAV_ITEMS.length;

  if (!ok) {
    console.error("FAIL — debate week readiness");
    process.exit(1);
  }
  console.log("OK — opposition data loaded; nav wired for debate week");
}

main();

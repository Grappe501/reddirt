/**
 * Debate week readiness — opposition JSON, daily packet, and nav wiring.
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadKimHammerWorkbench } from "../src/lib/opposition/kimHammerWorkbench";
import { loadOppositionArchiveRollup } from "../src/lib/opposition/oppositionBriefConfidence";
import { loadHumanActionQueue } from "../src/lib/intelligence/strategicDecisionSupport";
import { DEBATE_WEEK_NAV_ITEMS, DEBATE_WEEK_PRIMARY_NAV_ITEMS } from "../src/lib/intelligence/debate-week-nav";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const workbench = loadKimHammerWorkbench();
  const archive = loadOppositionArchiveRollup();
  const persistedQueue = loadHumanActionQueue();
  const openActions = persistedQueue.items.filter(
    (row) => row.status !== "ARCHIVED" && row.status !== "DISMISSED",
  ).length;
  console.log("Debate week readiness");
  console.log("  bills indexed:", workbench.totalBills);
  console.log("  debate drill cards:", workbench.debateDrillQueue.length);
  console.log("  research confidence:", workbench.researchConfidenceScore);
  console.log("  retrieval tasks:", `${archive.retrievalTasksComplete}/${archive.retrievalTasksTotal}`);
  console.log("  direct clips:", archive.directClipCount);
  console.log("  persisted queue items (open):", openActions);
  console.log("  debate subnav items:", DEBATE_WEEK_NAV_ITEMS.length);
  console.log("  primary candidate steps:", DEBATE_WEEK_PRIMARY_NAV_ITEMS.length);

  const ok =
    workbench.totalBills >= 18 &&
    workbench.debateDrillQueue.length >= 1 &&
    DEBATE_WEEK_NAV_ITEMS.length === 13 &&
    DEBATE_WEEK_PRIMARY_NAV_ITEMS.length === 5;

  if (!ok) {
    console.error("FAIL — debate week readiness");
    process.exit(1);
  }
  console.log("OK — opposition data loaded; nav wired for debate week");
}

main();
